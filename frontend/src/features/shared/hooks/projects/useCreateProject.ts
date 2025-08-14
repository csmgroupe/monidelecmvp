import { useAppDispatch } from '@/store/reduxStore';
import { createProject } from '@/modules/abplan/projects/application/use-cases/create-project';
import { CreateProjectDto } from '@/modules/abplan/projects/domain/project.entity';
import { useMutationWithToast } from '../utils/useMutationWithToast';
import { ProjectsProvider } from '@/modules/abplan/projects/infrastructure/ProjectsProvider';
import { actions } from '@/modules/abplan/projects/application/projects.actions';

export const useCreateProject = () => {
  const dispatch = useAppDispatch();
  const projectsProvider = new ProjectsProvider();

  return useMutationWithToast({
    mutationFn: async (data: CreateProjectDto) => {
      const project = await projectsProvider.createProject(data);
      dispatch(actions.createProject({ project }));
      dispatch(actions.setCurrentProject({ project }));
      return project;
    },
    // successMessage: 'Project created successfully',
    errorMessage: 'Erreur lors de la création du projet',
  });
}; 