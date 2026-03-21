"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSecret } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function AddSecretRow({
  environmentId,
  onSave,
  onCancel,
}: {
  environmentId: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);

  const createSecret = useCreateSecret(environmentId);

  function validateKey(k: string): string | null {
    const t = k.trim();
    if (!t) {
      return "Key is required";
    }
    if (/\s/.test(k)) {
      return "Key cannot contain spaces";
    }
    return null;
  }

  function handleSave() {
    const err = validateKey(key);
    if (err) {
      setKeyError(err);
      return;
    }
    setKeyError(null);
    createSecret.mutate(
      { key: key.trim(), value },
      {
        onSuccess: () => {
          onSave();
        },
      },
    );
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-zinc-800 bg-zinc-800/30 px-4 py-3">
      <div className="min-w-0">
        <Input
          autoFocus
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            if (keyError) {
              setKeyError(null);
            }
          }}
          placeholder="SECRET_KEY"
          className={cn(
            "font-mono text-sm",
            "border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500",
          )}
          aria-invalid={!!keyError}
        />
        {keyError ? (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {keyError}
          </p>
        ) : null}
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="value"
        className="font-mono text-sm border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
      />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-green-400 hover:bg-zinc-800 hover:text-green-300"
          aria-label="Save secret"
          disabled={createSecret.isPending}
          onClick={handleSave}
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Cancel"
          disabled={createSecret.isPending}
          onClick={onCancel}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
