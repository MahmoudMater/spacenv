"use client";

import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DeleteSpaceConfirmModal } from "@/components/spaces/delete-space-confirm-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useMe,
  useSpace,
  useUpdateSpace,
  useUpdateVisibilityRules,
} from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import {
  cn,
  getAccessLevelLabel,
  getEnvTypeBadgeClass,
  getEnvTypeLabel,
  spaceDescriptionToString,
} from "@/lib/utils";
import type {
  AccessLevel,
  ApiError,
  EnvironmentType,
  SpaceVisibilityRule,
  VisibilityRule,
} from "@/types";

const ALL_ENV_TYPES: EnvironmentType[] = [
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
  "QC",
  "OTHER",
];

function defaultAccessForEnvType(envType: EnvironmentType): AccessLevel {
  return envType === "PRODUCTION" ? "WRITERS" : "ALL";
}

function visibilityRulesFromSpace(
  rules: SpaceVisibilityRule[],
): VisibilityRule[] {
  const map = new Map(
    rules.map((r) => [r.envType, r.access] as const),
  );
  return ALL_ENV_TYPES.map((envType) => ({
    envType,
    access: map.get(envType) ?? defaultAccessForEnvType(envType),
  }));
}

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

function SpaceSettingsContent({ spaceId }: { spaceId: string }) {
  const setActiveSpace = useUIStore((s) => s.setActiveSpace);
  const openDeleteSpaceConfirm = useUIStore((s) => s.openDeleteSpaceConfirm);

  const { data: user } = useMe();
  const spaceQuery = useSpace(spaceId);
  const updateSpace = useUpdateSpace();
  const updateVisibility = useUpdateVisibilityRules(spaceId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [visibilityDraft, setVisibilityDraft] = useState<VisibilityRule[]>(
    () =>
      ALL_ENV_TYPES.map((envType) => ({
        envType,
        access: defaultAccessForEnvType(envType),
      })),
  );

  const space = spaceQuery.data;
  const isOwner = user?.id != null && space != null && user.id === space.ownerId;

  useEffect(() => {
    setActiveSpace(spaceId);
  }, [spaceId, setActiveSpace]);

  useEffect(() => {
    if (!space) {
      return;
    }
    setName(space.name);
    setDescription(spaceDescriptionToString(space.description) ?? "");
    setNameError(null);
    setVisibilityDraft(visibilityRulesFromSpace(space.visibilityRules));
  }, [space]);

  const visibilityDirty = useMemo(() => {
    if (!space) {
      return false;
    }
    const current = visibilityRulesFromSpace(space.visibilityRules);
    return JSON.stringify(current) !== JSON.stringify(visibilityDraft);
  }, [space, visibilityDraft]);

  function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    if (!space) {
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
    payload.description = d.length > 0 ? d : "";
    updateSpace.mutate({ id: spaceId, payload });
  }

  function handleSaveVisibility() {
    updateVisibility.mutate({ rules: visibilityDraft });
  }

  function setAccessForRow(envType: EnvironmentType, access: AccessLevel) {
    setVisibilityDraft((prev) =>
      prev.map((r) => (r.envType === envType ? { ...r, access } : r)),
    );
  }

  if (spaceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Skeleton className="mb-6 h-9 w-48" />
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (spaceQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-300">{queryErrorMessage(spaceQuery.error)}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            onClick={() => void spaceQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!space) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href={`/spaces/${spaceId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to space
      </Link>

      <h1 className="text-2xl font-semibold text-white">Space settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage how this space appears and who can view secrets by environment
        type.
      </p>

      {!isOwner ? (
        <Card className="mt-8 border-zinc-800 bg-zinc-900/50 p-6">
          <p className="text-sm text-zinc-300">
            Only the space owner can change name, visibility rules, or delete
            this space. You can still use projects and environments from the
            space home.
          </p>
          <div className="mt-6 space-y-4">
            <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
              Secret visibility (read-only)
            </h2>
            <ul className="space-y-2">
              {visibilityRulesFromSpace(space.visibilityRules).map((r) => (
                <li
                  key={r.envType}
                  className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm"
                >
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      getEnvTypeBadgeClass(r.envType),
                    )}
                  >
                    {getEnvTypeLabel(r.envType)}
                  </span>
                  <span className="text-zinc-400">
                    {getAccessLevelLabel(r.access)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
        <>
          <Card className="mt-8 border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-medium text-white">General</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Name and description shown on the dashboard and space home.
            </p>
            <form onSubmit={handleSaveGeneral} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settings-space-name" className="text-zinc-200">
                  Name
                </Label>
                <Input
                  id="settings-space-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) {
                      setNameError(null);
                    }
                  }}
                  maxLength={50}
                  className="border-zinc-800 bg-zinc-950 text-white"
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
                <Label htmlFor="settings-space-desc" className="text-zinc-200">
                  Description{" "}
                  <span className="font-normal text-zinc-500">(optional)</span>
                </Label>
                <Textarea
                  id="settings-space-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="border-zinc-800 bg-zinc-950 text-white"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateSpace.isPending}
                  className="bg-white text-zinc-950 hover:bg-zinc-200"
                >
                  {updateSpace.isPending ? (
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
          </Card>

          <Card className="mt-6 border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-sm font-medium text-white">
              Secret visibility
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Controls who can open and reveal secret values for each
              environment type in this space. Project members must still have
              access to the project.
            </p>
            <ul className="mt-6 space-y-3">
              {visibilityDraft.map((row) => (
                <li
                  key={row.envType}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span
                    className={cn(
                      "w-fit rounded-md px-2 py-0.5 text-xs font-medium",
                      getEnvTypeBadgeClass(row.envType),
                    )}
                  >
                    {getEnvTypeLabel(row.envType)}
                  </span>
                  <select
                    aria-label={`Who can view ${getEnvTypeLabel(row.envType)} secrets`}
                    value={row.access}
                    onChange={(e) =>
                      setAccessForRow(
                        row.envType,
                        e.target.value as AccessLevel,
                      )
                    }
                    className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-zinc-600 sm:max-w-xs"
                  >
                    <option value="OWNER_ONLY">
                      {getAccessLevelLabel("OWNER_ONLY")}
                    </option>
                    <option value="WRITERS">
                      {getAccessLevelLabel("WRITERS")}
                    </option>
                    <option value="ALL">{getAccessLevelLabel("ALL")}</option>
                  </select>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                disabled={updateVisibility.isPending || !visibilityDirty}
                onClick={handleSaveVisibility}
                className="bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
              >
                {updateVisibility.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save visibility rules"
                )}
              </Button>
            </div>
          </Card>

          <Card className="mt-6 border border-red-900/40 bg-red-950/10 p-6">
            <h2 className="text-sm font-medium text-red-200">Danger zone</h2>
            <p className="mt-1 text-sm text-red-200/70">
              Delete this space and all projects, environments, and secrets.
              This cannot be undone.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 border-red-800 bg-red-950/30 text-red-200 hover:bg-red-950/50"
              onClick={() =>
                openDeleteSpaceConfirm({ id: space.id, name: space.name })
              }
            >
              <Trash2 className="mr-2 size-4" />
              Delete space
            </Button>
          </Card>
        </>
      )}

      <DeleteSpaceConfirmModal />
    </div>
  );
}

export default function SpaceSettingsPage() {
  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;

  if (!spaceId) {
    return null;
  }

  return <SpaceSettingsContent spaceId={spaceId} />;
}
