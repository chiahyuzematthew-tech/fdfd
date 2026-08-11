import { create } from "zustand";

export type View =
  | { page: "auth"; mode: "login" | "register" }
  | { page: "dashboard" }
  | { page: "space"; spaceId: string }
  | { page: "submit"; slug: string }
  | { page: "wall"; slug: string };

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AppState {
  user: User | null;
  view: View;
  loading: boolean;
  setUser: (user: User | null) => void;
  setView: (view: View) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  view: { page: "auth", mode: "login" },
  loading: true,
  setUser: (user) => set({ user }),
  setView: (view) => set({ view }),
  setLoading: (loading) => set({ loading }),
}));
