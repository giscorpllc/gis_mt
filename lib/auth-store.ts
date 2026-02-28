import { create } from "zustand";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./tokens";

export interface AuthUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  kyc_status: string;
}

export interface PendingVerification {
  user_id: string;
  email: string;
  phone: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  // Held between registration and OTP verification
  pendingVerification: PendingVerification | null;

  // Actions
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  setPendingVerification: (data: PendingVerification) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Hydrate from cookies on first load (client-side only)
  accessToken: typeof window !== "undefined" ? getAccessToken() : null,
  refreshToken: typeof window !== "undefined" ? getRefreshToken() : null,
  user: null,
  pendingVerification: null,

  setTokens(access, refresh) {
    saveTokens(access, refresh);
    set({ accessToken: access, refreshToken: refresh });
  },

  setUser(user) {
    set({ user });
  },

  setPendingVerification(data) {
    set({ pendingVerification: data });
  },

  clearAuth() {
    clearTokens();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      pendingVerification: null,
    });
  },
}));
