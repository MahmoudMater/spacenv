"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { projectsApi } from "@/lib/api";
import { useUIStore } from "@/lib/stores";

import { invalidateNotificationQueries } from "./use-notifications";
import { spaceKeys } from "./use-spaces";
import type {
  ApiError,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: (spaceId: string) => [...projectKeys.all, "list", spaceId] as const,
  detail: (id: string) => [...projectKeys.all, id] as const,
};

export function useProjects(spaceId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.lists(spaceId ?? ""),
    queryFn: () => projectsApi.list(spaceId!),
    enabled: !!spaceId,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateProject(spaceId: string | null | undefined) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const closeCreateProject = useUIStore((s) => s.closeCreateProject);

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => {
      if (!spaceId) {
        return Promise.reject(new Error("No space selected"));
      }
      return projectsApi.create(spaceId, payload);
    },
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(project.spaceId),
      });
      await queryClient.invalidateQueries({
        queryKey: spaceKeys.detail(project.spaceId),
      });
      await invalidateNotificationQueries(queryClient);
      toast.success("Project created");
      closeCreateProject();
      router.push(`/projects/${project.id}`);
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not create project";
      toast.error(msg);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProjectPayload;
    }) => projectsApi.update(id, payload),
    onSuccess: async (data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(data.spaceId),
      });
      await invalidateNotificationQueries(queryClient);
      toast.success("Project updated");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not update project";
      toast.error(msg);
    },
  });
}

type DeleteProjectVars = { projectId: string; spaceId: string };

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ projectId }: DeleteProjectVars) =>
      projectsApi.remove(projectId),
    onSuccess: async (_data, { projectId, spaceId }) => {
      await queryClient.invalidateQueries({
        queryKey: projectKeys.lists(spaceId),
      });
      await queryClient.invalidateQueries({
        queryKey: spaceKeys.detail(spaceId),
      });
      await queryClient.removeQueries({
        queryKey: projectKeys.detail(projectId),
      });
      await invalidateNotificationQueries(queryClient);
      toast.success("Project deleted");
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/projects/")
      ) {
        router.push(`/spaces/${spaceId}`);
      }
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not delete project";
      toast.error(msg);
    },
  });
}
