"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import type { ApiError } from "@/types";
import { useAuthStore } from "@/lib/stores";

/** Safe in-app path from `?redirect=` after login/register (blocks open redirects). */
function getPostAuthRedirectPath(): string {
  if (typeof window === "undefined") {
    return "/dashboard";
  }
  const raw = new URLSearchParams(window.location.search).get("redirect");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  if (raw.includes(":")) {
    return "/dashboard";
  }
  return raw;
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setUser(query.data);
    }
  }, [query.isSuccess, query.data, setUser]);

  return query;
}

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      router.push(getPostAuthRedirectPath());
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      router.push(getPostAuthRedirectPath());
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      router.push("/login");
    },
    onError: (error: unknown) => {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "Could not sign out";
      toast.error(msg);
    },
  });
}
