import type { Notification } from "@/types";

import { apiClient } from "./client";

export const notificationsApi = {
  list: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>("/notifications");
    return data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch("/notifications/read");
  },

  markOneRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },
};
