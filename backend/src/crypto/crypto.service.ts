import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import _sodium from 'libsodium-wrappers';

@Injectable()
export class CryptoService {
  constructor(private readonly config: ConfigService) {}

  private async ensureReady(): Promise<void> {
    await _sodium.ready;
  }

  private getMasterKey(): Uint8Array {
    const hex = this.config.get<string>('MASTER_ENCRYPTION_KEY');
    if (!hex || !/^[0-9a-fA-F]+$/.test(hex) || hex.length !== 64) {
      throw new Error(
        'MASTER_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)',
      );
    }
    return _sodium.from_hex(hex);
  }

  async generateDek(): Promise<string> {
    await this.ensureReady();
    const key = _sodium.randombytes_buf(_sodium.crypto_secretbox_KEYBYTES);
    return _sodium.to_hex(key);
  }

  /** Base64-encoded nonce (24 bytes) + ciphertext. */
  async encryptDek(dek: string): Promise<string> {
    await this.ensureReady();
    const masterKey = this.getMasterKey();
    const dekBytes = _sodium.from_hex(dek);
    const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = _sodium.crypto_secretbox_easy(dekBytes, nonce, masterKey);
    const combined = new Uint8Array(nonce.length + ciphertext.length);
    combined.set(nonce, 0);
    combined.set(ciphertext, nonce.length);
    return Buffer.from(combined).toString('base64');
  }

  async decryptDek(encDek: string): Promise<string> {
    await this.ensureReady();
    const masterKey = this.getMasterKey();
    const combined = Buffer.from(encDek, 'base64');
    if (combined.length < _sodium.crypto_secretbox_NONCEBYTES) {
      throw new Error('Invalid encrypted DEK payload');
    }
    const nonce = combined.subarray(0, _sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = combined.subarray(_sodium.crypto_secretbox_NONCEBYTES);
    const opened = _sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      masterKey,
    );
    if (!opened) {
      throw new Error('Failed to decrypt DEK');
    }
    return _sodium.to_hex(opened);
  }

  async encryptValue(
    plaintext: string,
    dekHex: string,
  ): Promise<{ encryptedValue: string; iv: string }> {
    await this.ensureReady();
    const key = _sodium.from_hex(dekHex);
    if (key.length !== _sodium.crypto_secretbox_KEYBYTES) {
      throw new Error('DEK must decode to 32 bytes');
    }
    const message = new TextEncoder().encode(plaintext);
    const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = _sodium.crypto_secretbox_easy(message, nonce, key);
    return {
      encryptedValue: Buffer.from(ciphertext).toString('base64'),
      iv: Buffer.from(nonce).toString('base64'),
    };
  }

  async decryptValue(
    encryptedValue: string,
    iv: string,
    dekHex: string,
  ): Promise<string> {
    await this.ensureReady();
    const key = _sodium.from_hex(dekHex);
    if (key.length !== _sodium.crypto_secretbox_KEYBYTES) {
      throw new Error('DEK must decode to 32 bytes');
    }
    const ciphertext = Buffer.from(encryptedValue, 'base64');
    const nonce = Buffer.from(iv, 'base64');
    if (nonce.length !== _sodium.crypto_secretbox_NONCEBYTES) {
      throw new Error('Invalid IV length');
    }
    const opened = _sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      key,
    );
    if (!opened) {
      throw new Error('Failed to decrypt value');
    }
    return new TextDecoder().decode(opened);
  }
}
