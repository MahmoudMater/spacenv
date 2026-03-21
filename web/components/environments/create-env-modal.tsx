"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEnvironment } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import type { EnvironmentType } from "@/types";

const ENV_TYPES: EnvironmentType[] = [
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
  "QC",
  "OTHER",
];

export function CreateEnvModal() {
  const open = useUIStore((s) => s.isCreateEnvOpen);
  const closeCreateEnv = useUIStore((s) => s.closeCreateEnv);
  const projectId = useUIStore((s) => s.activeProjectId) ?? "";

  const createEnv = useCreateEnvironment(projectId);

  const [name, setName] = useState("");
  const [type, setType] = useState<EnvironmentType>("DEVELOPMENT");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setType("DEVELOPMENT");
    setDescription("");
    setNameError(null);
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      resetForm();
    } else {
      closeCreateEnv();
      resetForm();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    if (!projectId) {
      return;
    }
    setNameError(null);
    const payload: {
      name: string;
      type: EnvironmentType;
      description?: string;
    } = { name: trimmed, type };
    const d = description.trim();
    if (d) {
      payload.description = d;
    }
    createEnv.mutate(payload);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-51 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-50 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            Create environment
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-zinc-400">
            Add a new environment for this project.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="env-name" className="text-zinc-200">
                Name
              </Label>
              <Input
                id="env-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) {
                    setNameError(null);
                  }
                }}
                placeholder=".env.staging"
                maxLength={120}
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
                aria-invalid={!!nameError}
              />
              {nameError ? (
                <p className="text-destructive text-sm" role="alert">
                  {nameError}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-type" className="text-zinc-200">
                Type
              </Label>
              <select
                id="env-type"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as EnvironmentType)
                }
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
              >
                {ENV_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-desc" className="text-zinc-200">
                Description{" "}
                <span className="font-normal text-zinc-500">(optional)</span>
              </Label>
              <Textarea
                id="env-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                onClick={closeCreateEnv}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEnv.isPending || !projectId}
                className="bg-white text-zinc-950 hover:bg-zinc-200"
              >
                {createEnv.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
