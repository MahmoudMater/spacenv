"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { invitesApi } from "@/lib/api";
import type { AcceptInvitePayload, ApiError } from "@/types";

import { invalidateNotificationQueries } from "./use-notifications";
import { spaceKeys } from "./use-spaces";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return (error as ApiError).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

export function useAcceptInvite() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptInvitePayload) => invitesApi.accept(payload),
    onSuccess: async (data) => {
      await invalidateNotificationQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      router.push(`/spaces/${data.spaceId}`);
      toast.success("Welcome to the space!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
