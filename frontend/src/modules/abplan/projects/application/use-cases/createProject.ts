import { AppThunk } from '@/store/reduxStore';
import { actions } from '../projects.actions';
import { CreateProjectDto } from '../../domain/project.entity';

export const createProject: (projectData: CreateProjectDto) => AppThunk =
  projectData =>
  async (dispatch, _getState, { projectsProvider }) => {
    const project = await projectsProvider.create(projectData);
    dispatch(actions.createProject({ project }));
    dispatch(actions.setCurrentProject({ project }));
    return project;
  }; 