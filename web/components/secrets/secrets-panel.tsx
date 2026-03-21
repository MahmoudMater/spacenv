"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { AddSecretRow } from "@/components/secrets/add-secret-row";
import { SecretRow } from "@/components/secrets/secret-row";
import { SecretRowSkeleton } from "@/components/secrets/secret-row-skeleton";
import { Button } from "@/components/ui/button";
import { environmentsApi } from "@/lib/api";
import {
  useEnvironment,
  useMe,
  useProject,
  useSpace,
  useSecrets,
} from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import {
  cn,
  getEnvTypeBadgeClass,
  getEnvTypeLabel,
  githubRepoToUrl,
  spaceDescriptionToString,
} from "@/lib/utils";
import type { ApiError } from "@/types";

function queryErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return (error as ApiError).message;
  }
  return "Something went wrong";
}

export function SecretsPanel({
  environmentId,
  projectId,
}: {
  environmentId: string;
  projectId: string;
}) {
  const [showAddRow, setShowAddRow] = useState(false);
  const openPasteEnv = useUIStore((s) => s.openPasteEnv);

  const { data: user } = useMe();
  const { data: project } = useProject(projectId);
  const spaceId = project?.spaceId;
  const { data: space } = useSpace(spaceId);

  const envQuery = useEnvironment(environmentId);
  const secretsQuery = useSecrets(environmentId);

  const isSpaceOwner =
    user?.id != null && space != null && user.id === space.ownerId;
  const membership = space?.members.find((m) => m.userId === user?.id);
  const canWrite = isSpaceOwner || membership?.role === "WRITER";

  const env = envQuery.data;
  const secrets = secretsQuery.data ?? [];
  const desc = env ? spaceDescriptionToString(env.description) : null;
  const githubUrl = env ? githubRepoToUrl(env.githubRepo) : null;

  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label={
        project && env ? `${project.name} · ${env.name}` : "Secrets"
      }
    >
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {env ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-medium text-white">
                    {env.name}
                  </h1>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      getEnvTypeBadgeClass(env.type),
                    )}
                  >
                    {getEnvTypeLabel(env.type)}
                  </span>
                </div>
                {desc ? (
                  <p className="mt-1 text-xs text-zinc-500">{desc}</p>
                ) : null}
                {githubUrl ? (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {githubUrl}
                  </a>
                ) : null}
              </>
            ) : envQuery.isLoading ? (
              <div className="h-7 w-48 animate-pulse rounded bg-zinc-800" />
            ) : envQuery.isError ? (
              <p className="text-zinc-500">
                {queryErrorMessage(envQuery.error)}
              </p>
            ) : (
              <p className="text-zinc-500">Environment not found</p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
              onClick={() =>
                window.open(
                  environmentsApi.downloadUrl(environmentId),
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Download .env
            </Button>
            {canWrite ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="bg-white text-zinc-950 hover:bg-zinc-200"
                  onClick={() => setShowAddRow(true)}
                >
                  Add secret
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                  onClick={openPasteEnv}
                >
                  Paste .env
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-6 mt-4 flex-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900">
        <div
          className="grid grid-cols-[1fr_1fr_auto] gap-3 border-b border-zinc-800 px-4 py-2 text-xs font-medium tracking-wider text-zinc-500 uppercase"
          role="row"
        >
          <div role="columnheader">Key</div>
          <div role="columnheader">Value</div>
          <div role="columnheader" className="text-right" />
        </div>
        <div role="rowgroup">
          {secretsQuery.isError ? (
            <div className="py-8 text-center text-sm text-zinc-400">
              <p>{queryErrorMessage(secretsQuery.error)}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                onClick={() => void secretsQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : secretsQuery.isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <SecretRowSkeleton key={i} />
            ))
          ) : secrets.length === 0 && !showAddRow ? (
            <div className="py-8 text-center text-sm text-zinc-600">
              No secrets yet
            </div>
          ) : (
            <>
              {secrets.map((secret) => (
                <SecretRow
                  key={secret.id}
                  secret={secret}
                  environmentId={environmentId}
                  canWrite={canWrite}
                />
              ))}
              {showAddRow ? (
                <AddSecretRow
                  environmentId={environmentId}
                  onSave={() => setShowAddRow(false)}
                  onCancel={() => setShowAddRow(false)}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
