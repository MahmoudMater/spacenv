import type {
  AuthResponse,
  LoginPayload,
  MeUser,
  RegisterPayload,
  User,
} from "@/types";

import { API_BASE_URL, apiClient } from "./client";

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refresh: async (): Promise<void> => {
    await apiClient.post("/auth/refresh");
  },

  getMe: async (): Promise<MeUser> => {
    const { data } = await apiClient.get<MeUser>("/auth/me");
    return data;
  },

  /** Full URL for browser redirect (OAuth). Not an axios call. */
  googleAuthUrl: (): string => `${API_BASE_URL}/auth/google`,

  githubAuthUrl: (): string => `${API_BASE_URL}/auth/github`,
};
