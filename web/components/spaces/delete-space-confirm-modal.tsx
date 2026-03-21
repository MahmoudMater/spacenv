"use client";

import { Loader2 } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { useDeleteSpace } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";

export function DeleteSpaceConfirmModal() {
  const open = useUIStore((s) => s.isDeleteSpaceOpen);
  const target = useUIStore((s) => s.spaceDeleteTarget);
  const closeDeleteSpaceConfirm = useUIStore((s) => s.closeDeleteSpaceConfirm);
  const deleteSpace = useDeleteSpace();

  function handleOpenChange(next: boolean) {
    if (!next) {
      closeDeleteSpaceConfirm();
    }
  }

  function handleConfirm() {
    if (!target) {
      return;
    }
    deleteSpace.mutate(target.id, {
      onSuccess: () => {
        closeDeleteSpaceConfirm();
      },
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-51 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-50 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            Delete space?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-zinc-400">
            {target ? (
              <>
                <span className="font-medium text-zinc-200">{target.name}</span>{" "}
                and all of its projects, environments, and secrets will be
                permanently removed. This cannot be undone.
              </>
            ) : (
              "This space will be permanently removed."
            )}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
              onClick={closeDeleteSpaceConfirm}
              disabled={deleteSpace.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-500"
              disabled={deleteSpace.isPending || !target}
              onClick={handleConfirm}
            >
              {deleteSpace.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete space"
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
