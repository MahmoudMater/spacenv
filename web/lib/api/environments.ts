import type {
  CreateEnvironmentPayload,
  Environment,
  ImportSecretsPayload,
  UpdateEnvironmentPayload,
} from "@/types";

import { API_BASE_URL, apiClient } from "./client";

export const environmentsApi = {
  list: async (projectId: string): Promise<Environment[]> => {
    const { data } = await apiClient.get<Environment[]>(
      `/projects/${encodeURIComponent(projectId)}/environments`,
    );
    return data;
  },

  get: async (id: string): Promise<Environment> => {
    const { data } = await apiClient.get<Environment>(
      `/environments/${encodeURIComponent(id)}`,
    );
    return data;
  },

  create: async (
    projectId: string,
    payload: CreateEnvironmentPayload,
  ): Promise<Environment> => {
    const { data } = await apiClient.post<Environment>(
      `/projects/${encodeURIComponent(projectId)}/environments`,
      payload,
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateEnvironmentPayload,
  ): Promise<Environment> => {
    const { data } = await apiClient.patch<Environment>(
      `/environments/${encodeURIComponent(id)}`,
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/environments/${encodeURIComponent(id)}`);
  },

  importSecrets: async (
    id: string,
    payload: ImportSecretsPayload,
  ): Promise<{ count: number }> => {
    const { data } = await apiClient.post<{ imported: number }>(
      `/environments/${encodeURIComponent(id)}/import`,
      payload,
    );
    return { count: data.imported };
  },

  downloadUrl: (id: string): string =>
    `${API_BASE_URL}/environments/${encodeURIComponent(id)}/download`,
};
