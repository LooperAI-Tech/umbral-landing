import { create } from "zustand";
import { dashboardApi } from "@/lib/api/dashboard";
import type { DashboardStats, ActivityFeedItem } from "@/types";

interface DashboardState {
  stats: DashboardStats | null;
  activities: ActivityFeedItem[];
  activitiesTotal: number;
  isLoading: boolean;
  hasFetched: boolean;
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
  hasFetched: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await dashboardApi.getStats();
      set({ stats, isLoading: false, hasFetched: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch stats";
      set({ error: msg, isLoading: false, hasFetched: true });
    }
  },

  fetchActivity: async (limit = 20, offset = 0) => {
    try {
      const data = await dashboardApi.getActivity(limit, offset);
      set({ activities: Array.isArray(data?.activities) ? data.activities : [], activitiesTotal: data?.total ?? 0 });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch activity";
      set({ error: msg });
    }
  },

  clearError: () => set({ error: null }),
}));
