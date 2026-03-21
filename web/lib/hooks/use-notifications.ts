"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationsApi } from "@/lib/api";
import type { ApiError } from "@/types";

function toastApiError(error: unknown) {
  const msg =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
      ? (error as ApiError).message
      : "Something went wrong";
  toast.error(msg);
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

/** Refetch notifications after mutations that create in-app notifications on the server. */
export function invalidateNotificationQueries(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000,
  });
}

export function useUnreadCount(): number {
  const { data: notifications = [] } = useNotifications();
  return notifications.filter((n) => !n.read).length;
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: toastApiError,
  });
}

export function useMarkOneRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markOneRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    onError: toastApiError,
  });
}
