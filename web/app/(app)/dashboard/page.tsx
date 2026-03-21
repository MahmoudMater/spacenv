"use client";

import { FolderOpen, Plus } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateSpaceModal } from "@/components/spaces/create-space-modal";
import { DeleteSpaceConfirmModal } from "@/components/spaces/delete-space-confirm-modal";
import { EditSpaceModal } from "@/components/spaces/edit-space-modal";
import { SpaceCard } from "@/components/spaces/space-card";
import { SpaceCardSkeleton } from "@/components/spaces/space-card-skeleton";
import { useSpaces } from "@/lib/hooks";
import { useUIStore } from "@/lib/stores";
import type { ApiError, Space } from "@/types";

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
  return "Failed to load spaces";
}

function SpaceSection({
  title,
  description,
  spaces,
}: {
  title: string;
  description: string;
  spaces: Space[];
}) {
  if (spaces.length === 0) {
    return null;
  }

  return (
    <section className="mb-10 last:mb-0">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space) => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const setActiveSpace = useUIStore((s) => s.setActiveSpace);
  const setActiveProject = useUIStore((s) => s.setActiveProject);
  const openCreateSpace = useUIStore((s) => s.openCreateSpace);

  const { data, isLoading, isError, error, refetch } = useSpaces();

  const { owned, member } = useMemo(() => {
    const list = data ?? [];
    return {
      owned: list.filter((s) => s.viewerMembership === "OWNER"),
      member: list.filter((s) => s.viewerMembership === "MEMBER"),
    };
  }, [data]);

  useEffect(() => {
    setActiveSpace(null);
    setActiveProject(null);
  }, [setActiveSpace, setActiveProject]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Spaces</h1>
        <Button
          type="button"
          onClick={openCreateSpace}
          className="bg-white text-zinc-950 hover:bg-zinc-200"
        >
          <Plus className="mr-2 size-4" />
          New space
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SpaceCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-300">{queryErrorMessage(error)}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : data?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-zinc-800 bg-zinc-900 py-16">
          <FolderOpen className="mb-4 size-16 text-zinc-600" aria-hidden />
          <p className="text-zinc-400">No spaces yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Create a space or accept an invite to join one
          </p>
          <Button
            type="button"
            className="mt-6 bg-white text-zinc-950 hover:bg-zinc-200"
            onClick={openCreateSpace}
          >
            Create space
          </Button>
        </Card>
      ) : (
        <>
          <SpaceSection
            title="Your spaces"
            description="Spaces you created — you are the owner."
            spaces={owned}
          />
          <SpaceSection
            title="Spaces you're a member of"
            description="Shared spaces where someone else is the owner."
            spaces={member}
          />
        </>
      )}

      <CreateSpaceModal />
      <EditSpaceModal />
      <DeleteSpaceConfirmModal />
    </div>
  );
}
