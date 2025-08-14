import { AppThunk } from '@/store/reduxStore';
import { actions } from '../projects.actions';
import { CreateProjectDto } from '../../domain/project.entity';

export const createProject =
  (data: CreateProjectDto): AppThunk =>
  async (dispatch, _getState, { projectsProvider }) => {
    const project = await projectsProvider.createProject(data);
    dispatch(actions.createProject({ project }));
    return project;
  }; 