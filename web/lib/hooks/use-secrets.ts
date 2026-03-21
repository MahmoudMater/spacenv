"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { secretsApi } from "@/lib/api";

import { invalidateNotificationQueries } from "./use-notifications";
import { useSecretsStore } from "@/lib/stores";
import type { CreateSecretPayload, UpdateSecretPayload } from "@/types";

export const secretKeys = {
  all: ["secrets"] as const,
  lists: (environmentId: string) =>
    [...secretKeys.all, "list", environmentId] as const,
};

async function refreshSecretsList(
  queryClient: QueryClient,
  environmentId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: secretKeys.lists(environmentId),
  });
  await queryClient.refetchQueries({
    queryKey: secretKeys.lists(environmentId),
    type: "active",
  });
}

export function useSecrets(environmentId: string | undefined) {
  return useQuery({
    queryKey: secretKeys.lists(environmentId ?? ""),
    queryFn: () => secretsApi.list(environmentId!),
    enabled: !!environmentId,
  });
}

export function useRevealSecret() {
  const revealSecret = useSecretsStore((s) => s.revealSecret);

  return useMutation({
    mutationFn: (id: string) => secretsApi.reveal(id),
    onSuccess: (data, id) => {
      revealSecret(id, data.value);
    },
  });
}

export function useCopySecret() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { value } = await secretsApi.reveal(id);
      await navigator.clipboard.writeText(value);
    },
    onSuccess: () => {
      toast.success("Copied to clipboard");
    },
  });
}

export function useCreateSecret(environmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSecretPayload) =>
      secretsApi.create(environmentId, payload),
    onSuccess: async () => {
      await refreshSecretsList(queryClient, environmentId);
      await invalidateNotificationQueries(queryClient);
      toast.success("Secret created");
    },
  });
}

type UpdateSecretVars = { id: string; payload: UpdateSecretPayload };

export function useUpdateSecret(environmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSecretVars) =>
      secretsApi.update(id, payload),
    onSuccess: async () => {
      await refreshSecretsList(queryClient, environmentId);
      await invalidateNotificationQueries(queryClient);
      toast.success("Secret updated");
    },
  });
}

export function useDeleteSecret(environmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => secretsApi.remove(id),
    onSuccess: async () => {
      await refreshSecretsList(queryClient, environmentId);
      await invalidateNotificationQueries(queryClient);
      toast.success("Secret deleted");
    },
  });
}
