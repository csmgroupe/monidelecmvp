import { createAction } from '@reduxjs/toolkit';
import { Project } from '../domain/project.entity';

enum Types {
  CREATE_PROJECT = 'projects/createProject',
  LOAD_PROJECTS = 'projects/loadProjects',
  SET_PROJECTS = 'projects/setProjects',
  SET_CURRENT_PROJECT = 'projects/setCurrentProject',
  UPDATE_PROJECT = 'projects/updateProject',
  DELETE_PROJECT = 'projects/deleteProject',
}

export const actions = {
  createProject: createAction<{ project: Project }>(Types.CREATE_PROJECT),
  loadProjects: createAction(Types.LOAD_PROJECTS),
  setProjects: createAction<{ projects: Project[] }>(Types.SET_PROJECTS),
  setCurrentProject: createAction<{ project: Project | null }>(Types.SET_CURRENT_PROJECT),
  updateProject: createAction<{ project: Project }>(Types.UPDATE_PROJECT),
  deleteProject: createAction<{ projectId: string }>(Types.DELETE_PROJECT),
}; 