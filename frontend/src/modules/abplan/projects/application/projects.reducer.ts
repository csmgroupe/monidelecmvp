import { createReducer } from '@reduxjs/toolkit';
import { actions } from './projects.actions';
import { Project } from '../domain/project.entity';

export type ProjectsState = {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
};

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
};

export const projectsReducer = createReducer(initialState, builder => {
  builder
    .addCase(actions.loadProjects, state => {
      state.isLoading = true;
    })
    .addCase(actions.setProjects, (state, action) => {
      state.projects = action.payload.projects;
      state.isLoading = false;
    })
    .addCase(actions.createProject, (state, action) => {
      state.projects.unshift(action.payload.project);
    })
    .addCase(actions.setCurrentProject, (state, action) => {
      state.currentProject = action.payload.project;
    })
    .addCase(actions.updateProject, (state, action) => {
      const index = state.projects.findIndex(p => p.id === action.payload.project.id);
      if (index !== -1) {
        state.projects[index] = action.payload.project;
      }
      if (state.currentProject?.id === action.payload.project.id) {
        state.currentProject = action.payload.project;
      }
    })
    .addCase(actions.deleteProject, (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload.projectId);
      if (state.currentProject?.id === action.payload.projectId) {
        state.currentProject = null;
      }
    });
}); 