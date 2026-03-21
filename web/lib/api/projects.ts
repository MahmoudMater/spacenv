import type {
  CreateProjectPayload,
  Project,
  UpdateProjectPayload,
} from "@/types";

import { apiClient } from "./client";

export const projectsApi = {
  list: async (spaceId: string): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>(
      `/spaces/${encodeURIComponent(spaceId)}/projects`,
    );
    return data;
  },

  get: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(
      `/projects/${encodeURIComponent(id)}`,
    );
    return data;
  },

  create: async (
    spaceId: string,
    payload: CreateProjectPayload,
  ): Promise<Project> => {
    const { data } = await apiClient.post<Project>(
      `/spaces/${encodeURIComponent(spaceId)}/projects`,
      payload,
    );
    return data;
  },

  update: async (
    id: string,
    payload: UpdateProjectPayload,
  ): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(
      `/projects/${encodeURIComponent(id)}`,
      payload,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${encodeURIComponent(id)}`);
  },
};
