"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInviteMember } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import type { SpaceRole } from "@/types";

export function InviteMemberModal() {
  const open = useUIStore((s) => s.isInviteMemberOpen);
  const closeInviteMember = useUIStore((s) => s.closeInviteMember);
  const spaceId = useUIStore((s) => s.activeSpaceId) ?? "";

  const invite = useInviteMember(spaceId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SpaceRole>("WRITER");
  const [emailError, setEmailError] = useState<string | null>(null);

  function resetForm() {
    setEmail("");
    setRole("WRITER");
    setEmailError(null);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      resetForm();
    } else {
      closeInviteMember();
      resetForm();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email is required");
      return;
    }
    if (!spaceId) {
      return;
    }
    setEmailError(null);
    invite.mutate({ email: trimmed, role });
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-51 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-50 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            Invite to space
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-zinc-400">
            The user must already have an account. They receive an in-app
            notification with a link to accept. Default role is Writer (can
            change projects and secrets).
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-zinc-200">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) {
                    setEmailError(null);
                  }
                }}
                placeholder="colleague@company.com"
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
                aria-invalid={!!emailError}
              />
              {emailError ? (
                <p className="text-destructive text-sm" role="alert">
                  {emailError}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role" className="text-zinc-200">
                Role after they join
              </Label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as SpaceRole)}
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-zinc-600"
              >
                <option value="WRITER">Writer — edit projects and secrets</option>
                <option value="VIEWER">Viewer — read only</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                onClick={closeInviteMember}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={invite.isPending || !spaceId}
                className="bg-white text-zinc-950 hover:bg-zinc-200"
              >
                {invite.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send invite"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
