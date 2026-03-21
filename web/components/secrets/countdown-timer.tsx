"use client";

import { useEffect, useState } from "react";

import { useSecretsStore } from "@/lib/stores";

export function CountdownTimer({ secretId }: { secretId: string }) {
  const expiresAt = useSecretsStore((s) => s.revealExpiresAt[secretId]);
  const hideSecret = useSecretsStore((s) => s.hideSecret);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (expiresAt === undefined) {
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSeconds(left);
      if (left <= 0) {
        hideSecret(secretId);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, secretId, hideSecret]);

  if (expiresAt === undefined) {
    return null;
  }

  return (
    <span className="text-xs text-zinc-500">hiding in {seconds}s</span>
  );
}
