import { AppThunk } from '@/store/reduxStore';
import { actions } from '../projects.actions';

export const loadProjects: () => AppThunk =
  () =>
  async (dispatch, _getState, { projectsProvider }) => {
    dispatch(actions.loadProjects());
    const projects = await projectsProvider.findAll();
    dispatch(actions.setProjects({ projects }));
    return projects;
  }; 