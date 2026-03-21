"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { spacesApi } from "@/lib/api";
import { useUIStore } from "@/lib/stores";
import type {
  ApiError,
  InviteMemberPayload,
  UpdateSpaceMemberRolePayload,
  UpdateSpacePayload,
  UpdateVisibilityRulesPayload,
} from "@/types";

import { invalidateNotificationQueries } from "./use-notifications";

export const spaceKeys = {
  all: ["spaces"] as const,
  lists: () => [...spaceKeys.all, "list"] as const,
  detail: (id: string) => [...spaceKeys.all, id] as const,
  visibility: (id: string) => [...spaceKeys.all, id, "visibility"] as const,
};

export function useSpaces() {
  return useQuery({
    queryKey: spaceKeys.lists(),
    queryFn: () => spacesApi.list(),
  });
}

export function useSpace(id: string | undefined) {
  return useQuery({
    queryKey: spaceKeys.detail(id ?? ""),
    queryFn: () => spacesApi.get(id!),
    enabled: !!id,
  });
}

/**
 * Space members — shares the same cache as `useSpace(id)` (GET `/spaces/{id}`).
 */
export function useSpaceMembers(id: string | undefined) {
  return useQuery({
    queryKey: spaceKeys.detail(id ?? ""),
    queryFn: () => spacesApi.get(id!),
    enabled: !!id,
    select: (data) => data.members,
  });
}

export function useVisibilityRules(id: string | undefined) {
  return useQuery({
    queryKey: spaceKeys.visibility(id ?? ""),
    queryFn: () => spacesApi.getVisibilityRules(id!),
    enabled: !!id,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  const closeCreateSpace = useUIStore((s) => s.closeCreateSpace);

  return useMutation({
    mutationFn: spacesApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      toast.success("Space created");
      closeCreateSpace();
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not create space";
      toast.error(msg);
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSpacePayload;
    }) => spacesApi.update(id, payload),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: spaceKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      toast.success("Space updated");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not update space";
      toast.error(msg);
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => spacesApi.remove(id),
    onSuccess: async (_void, id) => {
      await queryClient.invalidateQueries({ queryKey: spaceKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: spaceKeys.lists() });
      toast.success("Space deleted");
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not delete space";
      toast.error(msg);
    },
  });
}

export function useInviteMember(spaceId: string) {
  const queryClient = useQueryClient();
  const closeInviteMember = useUIStore((s) => s.closeInviteMember);

  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => {
      if (!spaceId) {
        return Promise.reject(new Error("No space selected"));
      }
      return spacesApi.inviteMember(spaceId, payload);
    },
    onSuccess: async () => {
      if (spaceId) {
        await queryClient.invalidateQueries({
          queryKey: spaceKeys.detail(spaceId),
        });
      }
      await invalidateNotificationQueries(queryClient);
      toast.success("Invite sent");
      closeInviteMember();
    },
  });
}

export function useRemoveSpaceMember(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      spacesApi.removeMember(spaceId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: spaceKeys.detail(spaceId),
      });
      toast.success("Member removed");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not remove member";
      toast.error(msg);
    },
  });
}

export function useUpdateSpaceMemberRole(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateSpaceMemberRolePayload;
    }) => spacesApi.updateMemberRole(spaceId, userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: spaceKeys.detail(spaceId),
      });
      toast.success("Role updated");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not update role";
      toast.error(msg);
    },
  });
}

export function useUpdateVisibilityRules(spaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVisibilityRulesPayload) =>
      spacesApi.updateVisibilityRules(spaceId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: spaceKeys.visibility(spaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: spaceKeys.detail(spaceId),
        }),
      ]);
      toast.success("Visibility rules updated");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not update visibility rules";
      toast.error(msg);
    },
  });
}
