import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: {
    id: number;
    name: string;
    company_id: number;
    [key: string]: any;
  } | null;
  setToken: (token: string) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: null,
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
}));
