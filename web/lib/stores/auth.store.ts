import { create } from "zustand";

import type { User } from "@/types";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setLoading: (v) => set({ isLoading: v }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));
