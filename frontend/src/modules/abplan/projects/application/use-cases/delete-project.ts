import { AppThunk } from '@/store/reduxStore';
import { actions } from '../projects.actions';

export const deleteProject =
  (projectId: string): AppThunk =>
  async (dispatch, _getState, { projectsProvider }) => {
    await projectsProvider.deleteProject(projectId);
    dispatch(actions.deleteProject({ projectId }));
  }; 