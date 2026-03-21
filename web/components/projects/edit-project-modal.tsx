"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProject } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";

export function EditProjectModal() {
  const open = useUIStore((s) => s.isEditProjectOpen);
  const draft = useUIStore((s) => s.projectEditDraft);
  const closeEditProject = useUIStore((s) => s.closeEditProject);
  const updateProject = useUpdateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open && draft) {
      setName(draft.name);
      setDescription(draft.description);
      setNameError(null);
    }
  }, [open, draft]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      closeEditProject();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) {
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    setNameError(null);
    const payload: { name: string; description?: string } = {
      name: trimmed,
    };
    const d = description.trim();
    if (d) {
      payload.description = d;
    } else {
      payload.description = "";
    }
    updateProject.mutate(
      { id: draft.id, payload },
      {
        onSuccess: () => {
          closeEditProject();
        },
      },
    );
  }

  if (!draft && !open) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-51 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-50 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            Edit project
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-zinc-400">
            Update the name and description. Requires Writer access or ownership
            of the space.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name" className="text-zinc-200">
                Name
              </Label>
              <Input
                id="edit-project-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) {
                    setNameError(null);
                  }
                }}
                maxLength={50}
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
                aria-invalid={!!nameError}
              />
              <p className="text-xs text-zinc-500">{name.length} / 50</p>
              {nameError ? (
                <p className="text-destructive text-sm" role="alert">
                  {nameError}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-desc" className="text-zinc-200">
                Description{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </Label>
              <Textarea
                id="edit-project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                onClick={closeEditProject}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProject.isPending || !draft}
                className="bg-white text-zinc-950 hover:bg-zinc-200"
              >
                {updateProject.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
