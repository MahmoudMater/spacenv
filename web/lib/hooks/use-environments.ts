"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { environmentsApi } from "@/lib/api";
import { useUIStore } from "@/lib/stores";
import type {
  CreateEnvironmentPayload,
  ImportSecretsPayload,
  UpdateEnvironmentPayload,
} from "@/types";

import { invalidateNotificationQueries } from "./use-notifications";
import { secretKeys } from "./use-secrets";

export const envKeys = {
  all: ["environments"] as const,
  lists: (projectId: string) =>
    [...envKeys.all, "list", projectId] as const,
  detail: (id: string) => [...envKeys.all, id] as const,
};

export function useEnvironments(projectId: string | undefined) {
  return useQuery({
    queryKey: envKeys.lists(projectId ?? ""),
    queryFn: () => environmentsApi.list(projectId!),
    enabled: !!projectId,
  });
}

export function useEnvironment(id: string | undefined) {
  return useQuery({
    queryKey: envKeys.detail(id ?? ""),
    queryFn: () => environmentsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateEnvironment(projectId: string) {
  const queryClient = useQueryClient();
  const closeCreateEnv = useUIStore((s) => s.closeCreateEnv);

  return useMutation({
    mutationFn: (payload: CreateEnvironmentPayload) => {
      if (!projectId) {
        return Promise.reject(new Error("No project selected"));
      }
      return environmentsApi.create(projectId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: envKeys.lists(projectId),
      });
      await invalidateNotificationQueries(queryClient);
      toast.success("Environment created");
      closeCreateEnv();
    },
  });
}

type DeleteEnvVars = { id: string; projectId: string };

export function useDeleteEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteEnvVars) => environmentsApi.remove(id),
    onSuccess: async (_data, { id, projectId }) => {
      await queryClient.invalidateQueries({
        queryKey: envKeys.lists(projectId),
      });
      await queryClient.removeQueries({ queryKey: envKeys.detail(id) });
      await invalidateNotificationQueries(queryClient);
      toast.success("Environment deleted");
    },
  });
}

export function useUpdateEnvironment(envId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEnvironmentPayload) =>
      environmentsApi.update(envId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: envKeys.detail(envId),
      });
      await queryClient.invalidateQueries({
        queryKey: envKeys.lists(projectId),
      });
      await invalidateNotificationQueries(queryClient);
      toast.success("Environment updated");
    },
  });
}

export function useImportSecrets(envId: string | undefined) {
  const queryClient = useQueryClient();
  const closePasteEnv = useUIStore((s) => s.closePasteEnv);

  return useMutation({
    mutationFn: (payload: ImportSecretsPayload) => {
      if (!envId) {
        return Promise.reject(new Error("No environment selected"));
      }
      return environmentsApi.importSecrets(envId, payload);
    },
    onSuccess: async (data) => {
      toast.success(`Imported ${data.count} secrets`);
      if (envId) {
        await queryClient.invalidateQueries({
          queryKey: envKeys.detail(envId),
        });
        await queryClient.invalidateQueries({
          queryKey: secretKeys.lists(envId),
        });
        await queryClient.refetchQueries({
          queryKey: secretKeys.lists(envId),
          type: "active",
        });
      }
      await invalidateNotificationQueries(queryClient);
      closePasteEnv();
    },
  });
}
