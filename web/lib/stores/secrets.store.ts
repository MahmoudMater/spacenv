import { create } from "zustand";

const REVEAL_TTL_MS = 30_000;

type SecretsState = {
  revealedSecrets: Record<string, string>;
  /** Epoch ms when the reveal expires (for UI countdown). */
  revealExpiresAt: Record<string, number>;
  revealTimers: Record<string, ReturnType<typeof setTimeout>>;

  revealSecret: (id: string, value: string) => void;
  hideSecret: (id: string) => void;
  isRevealed: (id: string) => boolean;
  getRevealedValue: (id: string) => string | undefined;
  getRevealExpiresAt: (id: string) => number | undefined;
  hideAll: () => void;
};

export const useSecretsStore = create<SecretsState>((set, get) => ({
  revealedSecrets: {},
  revealExpiresAt: {},
  revealTimers: {},

  revealSecret: (id, value) => {
    const prevTimer = get().revealTimers[id];
    if (prevTimer !== undefined) {
      clearTimeout(prevTimer);
    }

    const expiresAt = Date.now() + REVEAL_TTL_MS;
    const timer = setTimeout(() => {
      get().hideSecret(id);
    }, REVEAL_TTL_MS);

    set((state) => ({
      revealedSecrets: { ...state.revealedSecrets, [id]: value },
      revealExpiresAt: { ...state.revealExpiresAt, [id]: expiresAt },
      revealTimers: { ...state.revealTimers, [id]: timer },
    }));
  },

  hideSecret: (id) => {
    set((state) => {
      const t = state.revealTimers[id];
      if (t !== undefined) {
        clearTimeout(t);
      }
      const nextSecrets = { ...state.revealedSecrets };
      const nextTimers = { ...state.revealTimers };
      const nextExpires = { ...state.revealExpiresAt };
      delete nextSecrets[id];
      delete nextTimers[id];
      delete nextExpires[id];
      return {
        revealedSecrets: nextSecrets,
        revealTimers: nextTimers,
        revealExpiresAt: nextExpires,
      };
    });
  },

  isRevealed: (id) => id in get().revealedSecrets,

  getRevealedValue: (id) => get().revealedSecrets[id],

  getRevealExpiresAt: (id) => get().revealExpiresAt[id],

  hideAll: () => {
    const { revealTimers } = get();
    for (const t of Object.values(revealTimers)) {
      clearTimeout(t);
    }
    set({
      revealedSecrets: {},
      revealExpiresAt: {},
      revealTimers: {},
    });
  },
}));
