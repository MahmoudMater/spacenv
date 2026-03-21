"use client";

import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { CountdownTimer } from "@/components/secrets/countdown-timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCopySecret,
  useDeleteSecret,
  useRevealSecret,
  useUpdateSecret,
} from "@/lib/hooks";
import { useSecretsStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import type { Secret } from "@/types";

const BULLETS = "••••••••••••";

export function SecretRow({
  secret,
  environmentId,
  canWrite,
}: {
  secret: Secret;
  environmentId: string;
  canWrite: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isRevealed = useSecretsStore((s) => s.isRevealed(secret.id));
  const revealedValue = useSecretsStore((s) => s.getRevealedValue(secret.id));
  const hideSecret = useSecretsStore((s) => s.hideSecret);

  const revealSecret = useRevealSecret();
  const copySecret = useCopySecret();
  const updateSecret = useUpdateSecret(environmentId);
  const deleteSecret = useDeleteSecret(environmentId);

  const revealPending =
    revealSecret.isPending && revealSecret.variables === secret.id;

  return (
    <div
      className={cn(
        "group grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-zinc-800 px-4 py-3 last:border-0",
        "hover:bg-zinc-800/30",
        isRevealed && "bg-green-500/5",
      )}
    >
      <div className="min-w-0 font-mono text-sm text-zinc-200">
        {secret.key}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Enter new value..."
            className="font-mono text-sm border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500"
          />
        ) : isRevealed && revealedValue !== undefined ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="break-all font-mono text-sm text-green-400">
              {revealedValue}
            </span>
            <CountdownTimer secretId={secret.id} />
          </div>
        ) : (
          <span className="font-mono text-sm text-zinc-600">{BULLETS}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-green-400 hover:bg-zinc-800 hover:text-green-300"
              aria-label="Save changes"
              disabled={updateSecret.isPending}
              onClick={() => {
                updateSecret.mutate(
                  { id: secret.id, payload: { value: editValue } },
                  {
                    onSuccess: () => {
                      setIsEditing(false);
                      setEditValue("");
                    },
                  },
                );
              }}
            >
              <Check className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Cancel edit"
              disabled={updateSecret.isPending}
              onClick={() => {
                setIsEditing(false);
                setEditValue("");
              }}
            >
              <X className="size-4" />
            </Button>
          </>
        ) : showDeleteConfirm ? (
          <>
            <span className="px-1 text-xs text-red-400">Delete?</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-red-400 hover:bg-zinc-800 hover:text-red-300"
              aria-label="Confirm delete"
              disabled={deleteSecret.isPending}
              onClick={() => {
                deleteSecret.mutate(secret.id, {
                  onSuccess: () => {
                    hideSecret(secret.id);
                    setShowDeleteConfirm(false);
                  },
                });
              }}
            >
              <Check className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Cancel delete"
              disabled={deleteSecret.isPending}
              onClick={() => setShowDeleteConfirm(false)}
            >
              <X className="size-4" />
            </Button>
          </>
        ) : (
          <div
            className={cn(
              "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label={isRevealed ? "Hide value" : "Reveal value"}
              disabled={revealPending}
              onClick={() => {
                if (isRevealed) {
                  hideSecret(secret.id);
                } else {
                  revealSecret.mutate(secret.id);
                }
              }}
            >
              {isRevealed ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Copy secret"
              disabled={copySecret.isPending}
              onClick={() => copySecret.mutate(secret.id)}
            >
              <Copy className="size-4" />
            </Button>
            {canWrite ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  aria-label="Edit secret"
                  onClick={() => {
                    setIsEditing(true);
                    setEditValue("");
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                  aria-label="Delete secret"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
