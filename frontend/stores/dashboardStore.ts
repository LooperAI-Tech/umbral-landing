import { create } from "zustand";
import { dashboardApi } from "@/lib/api/dashboard";
import type { DashboardStats, ActivityFeedItem } from "@/types";

interface DashboardState {
  stats: DashboardStats | null;
  activities: ActivityFeedItem[];
  activitiesTotal: number;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchActivity: (limit?: number, offset?: number) => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  activities: [],
  activitiesTotal: 0,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await dashboardApi.getStats();
      set({ stats, isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch stats";
      set({ error: msg, isLoading: false });
    }
  },

  fetchActivity: async (limit = 20, offset = 0) => {
    try {
      const data = await dashboardApi.getActivity(limit, offset);
      set({ activities: data.activities, activitiesTotal: data.total });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch activity";
      set({ error: msg });
    }
  },

  clearError: () => set({ error: null }),
}));
