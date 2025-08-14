import { AppThunk } from '@/store/reduxStore';
import { actions } from '../projects.actions';

interface LoadProjectsParams {
  page?: number;
  limit?: number;
}

export const loadProjects =
  (params: LoadProjectsParams = {}): AppThunk =>
  async (dispatch, _getState, { projectsProvider }) => {
    const { page = 1, limit = 10 } = params;
    const result = await projectsProvider.getProjects(page, limit);
    dispatch(actions.setProjects({ projects: result.projects }));
    return result;
  }; 