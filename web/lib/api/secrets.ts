import type {
  CreateSecretPayload,
  Secret,
  SecretReveal,
  UpdateSecretPayload,
} from "@/types";

import { apiClient } from "./client";

export const secretsApi = {
  list: async (environmentId: string): Promise<Secret[]> => {
    const { data } = await apiClient.get<Secret[]>(
      `/environments/${encodeURIComponent(environmentId)}/secrets`,
    );
    return data;
  },

  reveal: async (id: string): Promise<SecretReveal> => {
    const { data } = await apiClient.post<SecretReveal>(
      `/secrets/${encodeURIComponent(id)}/reveal`,
    );
    return data;
  },

  create: async (
    environmentId: string,
    payload: CreateSecretPayload,
  ): Promise<Secret> => {
    const { data } = await apiClient.post<Secret>(
      `/environments/${encodeURIComponent(environmentId)}/secrets`,
      payload,
    );
    return data;
  },

  update: async (id: string, payload: UpdateSecretPayload): Promise<Secret> => {
    const { data } = await apiClient.patch<Secret>(
      `/secrets/${encodeURIComponent(id)}`,
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/secrets/${encodeURIComponent(id)}`);
  },
};
