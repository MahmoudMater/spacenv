"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useImportSecrets } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";

export function PasteEnvModal() {
  const open = useUIStore((s) => s.isPasteEnvOpen);
  const closePasteEnv = useUIStore((s) => s.closePasteEnv);
  const environmentId = useUIStore((s) => s.activeEnvironmentId);

  const importSecrets = useImportSecrets(environmentId ?? undefined);

  const [raw, setRaw] = useState("");

  function handleOpenChange(next: boolean) {
    if (next) {
      setRaw("");
    } else {
      closePasteEnv();
      setRaw("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!environmentId) {
      return;
    }
    importSecrets.mutate({ rawEnv: raw });
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-51 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-50 shadow-lg outline-none">
          <Dialog.Title className="text-lg font-semibold text-white">
            Paste .env file
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-zinc-400">
            Paste the contents of a .env file. Keys will be imported into the
            active environment.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!environmentId ? (
              <p className="text-sm text-amber-400">
                Select an environment first.
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="paste-env-raw" className="text-zinc-200">
                Contents
              </Label>
              <Textarea
                id="paste-env-raw"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={12}
                placeholder="KEY=value"
                className="font-mono text-sm border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                onClick={closePasteEnv}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  importSecrets.isPending || !environmentId || !raw.trim()
                }
                className="bg-white text-zinc-950 hover:bg-zinc-200"
              >
                {importSecrets.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Importing…
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
