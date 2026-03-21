import type {
  CreateSpacePayload,
  InviteMemberPayload,
  InviteSentResponse,
  Space,
  SpaceDetail,
  SpaceMember,
  SpaceVisibilityRule,
  UpdateSpaceMemberRolePayload,
  UpdateSpacePayload,
  UpdateVisibilityRulesPayload,
  VisibilityRule,
} from "@/types";

import { apiClient } from "./client";

export const spacesApi = {
  list: async (): Promise<Space[]> => {
    const { data } = await apiClient.get<Space[]>("/spaces");
    return data;
  },

  get: async (id: string): Promise<SpaceDetail> => {
    const { data } = await apiClient.get<SpaceDetail>(
      `/spaces/${encodeURIComponent(id)}`,
    );
    return data;
  },

  create: async (payload: CreateSpacePayload): Promise<SpaceDetail> => {
    const { data } = await apiClient.post<SpaceDetail>("/spaces", payload);
    return data;
  },

  update: async (id: string, payload: UpdateSpacePayload): Promise<Space> => {
    const { data } = await apiClient.patch<
      Pick<
        Space,
        "id" | "name" | "ownerId" | "createdAt" | "updatedAt"
      > & { description: string | null }
    >(`/spaces/${encodeURIComponent(id)}`, payload);
    return data as unknown as Space;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/spaces/${encodeURIComponent(id)}`);
  },

  getMembers: async (id: string): Promise<SpaceMember[]> => {
    const { data } = await apiClient.get<SpaceDetail>(
      `/spaces/${encodeURIComponent(id)}`,
    );
    return data.members;
  },

  inviteMember: async (
    id: string,
    payload: InviteMemberPayload,
  ): Promise<InviteSentResponse> => {
    const { data } = await apiClient.post<InviteSentResponse>(
      `/spaces/${encodeURIComponent(id)}/invite`,
      payload,
    );
    return data;
  },

  removeMember: async (spaceId: string, userId: string): Promise<void> => {
    await apiClient.delete(
      `/spaces/${encodeURIComponent(spaceId)}/members/${encodeURIComponent(userId)}`,
    );
  },

  updateMemberRole: async (
    spaceId: string,
    userId: string,
    payload: UpdateSpaceMemberRolePayload,
  ): Promise<SpaceMember> => {
    const { data } = await apiClient.patch<SpaceMember>(
      `/spaces/${encodeURIComponent(spaceId)}/members/${encodeURIComponent(userId)}`,
      payload,
    );
    return data;
  },

  getVisibilityRules: async (id: string): Promise<VisibilityRule[]> => {
    const { data } = await apiClient.get<SpaceDetail>(
      `/spaces/${encodeURIComponent(id)}`,
    );
    return data.visibilityRules.map((r) => ({
      envType: r.envType,
      access: r.access,
    }));
  },

  updateVisibilityRules: async (
    id: string,
    payload: UpdateVisibilityRulesPayload,
  ): Promise<SpaceVisibilityRule[]> => {
    const { data } = await apiClient.patch<SpaceVisibilityRule[]>(
      `/spaces/${encodeURIComponent(id)}/visibility`,
      payload,
    );
    return data;
  },
};
