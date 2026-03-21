"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { CreateEnvModal } from "@/components/environments/create-env-modal";
import { EnvTabsSidebar } from "@/components/environments/env-tabs-sidebar";
import { PasteEnvModal } from "@/components/environments/paste-env-modal";
import { InviteMemberModal } from "@/components/spaces/invite-member-modal";
import { SecretsPanel } from "@/components/secrets/secrets-panel";
import { Button } from "@/components/ui/button";
import { useEnvironments, useProject } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";

function queryErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: string }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Something went wrong";
}

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const setActiveProject = useUIStore((s) => s.setActiveProject);
  const setActiveSpace = useUIStore((s) => s.setActiveSpace);
  const setActiveEnvironment = useUIStore((s) => s.setActiveEnvironment);
  const activeEnvironmentId = useUIStore((s) => s.activeEnvironmentId);

  const projectQuery = useProject(projectId);
  const environmentsQuery = useEnvironments(projectId);

  useEffect(() => {
    if (projectId) {
      setActiveProject(projectId);
    }
  }, [projectId, setActiveProject]);

  useEffect(() => {
    const spaceId = projectQuery.data?.spaceId;
    if (spaceId) {
      setActiveSpace(spaceId);
    }
  }, [projectQuery.data?.spaceId, setActiveSpace]);

  useEffect(() => {
    setActiveEnvironment(null);
  }, [projectId, setActiveEnvironment]);

  useEffect(() => {
    const list = environmentsQuery.data;
    if (list === undefined) {
      return;
    }
    if (list.length === 0) {
      setActiveEnvironment(null);
      return;
    }
    const current = useUIStore.getState().activeEnvironmentId;
    if (current !== null && list.some((e) => e.id === current)) {
      return;
    }
    setActiveEnvironment(list[0]!.id);
  }, [projectId, environmentsQuery.data, setActiveEnvironment]);

  if (!projectId) {
    return null;
  }

  if (projectQuery.isLoading) {
    return (
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">
        <div className="h-full w-56 shrink-0 animate-pulse border-r border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-4 h-4 w-24 rounded bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-9 rounded bg-zinc-800" />
            <div className="h-9 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="min-w-0 flex-1 p-6">
          <div className="mb-4 h-8 w-64 rounded bg-zinc-800" />
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-10 rounded bg-zinc-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projectQuery.isError) {
    return (
      <div className="flex h-[calc(100vh-48px)] items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-300">{queryErrorMessage(projectQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            onClick={() => void projectQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const environments = environmentsQuery.data ?? [];
  const hasEnvironments = environments.length > 0;

  return (
    <>
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">
        <EnvTabsSidebar projectId={projectId} />
        <div
          className="w-px shrink-0 self-stretch border-r border-zinc-800"
          aria-hidden
        />
        <main className="min-w-0 flex-1 overflow-y-auto">
          {environmentsQuery.isError ? (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-md rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <p className="text-zinc-300">
                  {queryErrorMessage(environmentsQuery.error)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
                  onClick={() => void environmentsQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : !hasEnvironments ? (
            environmentsQuery.isLoading ? (
              <div className="flex h-full items-center justify-center text-zinc-500">
                Loading environments…
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="text-zinc-400">
                  No environments yet. Create your first environment.
                </p>
              </div>
            )
          ) : activeEnvironmentId ? (
            <SecretsPanel
              environmentId={activeEnvironmentId}
              projectId={projectId}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500">
              Select an environment
            </div>
          )}
        </main>
      </div>
      <CreateEnvModal />
      <PasteEnvModal />
      <InviteMemberModal />
    </>
  );
}
