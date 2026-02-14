import { create } from "zustand";
import { projectsApi } from "@/lib/api/projects";
import type { Project, ProjectCreate, ProjectUpdate } from "@/types";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  hasFetched: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: ProjectCreate) => Promise<Project>;
  updateProject: (id: string, data: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  hasFetched: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsApi.list();
      set({ projects: Array.isArray(projects) ? projects : [], isLoading: false, hasFetched: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch projects";
      set({ error: msg, isLoading: false, hasFetched: true });
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.get(id);
      set({ currentProject: project, isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to fetch project";
      set({ error: msg, isLoading: false });
    }
  },

  createProject: async (data: ProjectCreate) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.create(data);
      set((state) => ({
        projects: [project, ...state.projects],
        isLoading: false,
      }));
      return project;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create project";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, data: ProjectUpdate) => {
    try {
      const updated = await projectsApi.update(id, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update project";
      set({ error: msg });
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectsApi.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to delete project";
      set({ error: msg });
    }
  },

  clearError: () => set({ error: null }),
}));
