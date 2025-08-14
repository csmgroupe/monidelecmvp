import { AppState } from '@/store/appState';

export const selectProjects = (state: AppState) => state.projects.projects;

export const selectCurrentProject = (state: AppState) => state.projects.currentProject;

export const selectProjectsLoading = (state: AppState) => state.projects.isLoading;

export const selectProjectById = (id: string) => (state: AppState) =>
  state.projects.projects.find(project => project.id === id);

export const selectProjectsByStatus = (status: string) => (state: AppState) =>
  state.projects.projects.filter(project => project?.status === status);

export const selectDraftProjects = (state: AppState) =>
  state.projects.projects.filter(project => project && (project.status === 'draft' || !project.status));

export const selectCompletedProjects = (state: AppState) =>
  state.projects.projects.filter(project => project?.status === 'completed'); 