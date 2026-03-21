import type { AcceptInvitePayload, SpaceDetail } from "@/types";

import { apiClient } from "./client";

export const invitesApi = {
  accept: async (
    payload: AcceptInvitePayload,
  ): Promise<{ spaceId: string }> => {
    const { data } = await apiClient.post<SpaceDetail>("/invites/accept", payload);
    return { spaceId: data.id };
  },
};
