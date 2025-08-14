import { useAppDispatch } from '@/store/reduxStore';
import { UpdateProjectDto } from '@/modules/abplan/projects/domain/project.entity';
import { useMutationWithToast } from '../utils/useMutationWithToast';
import { ProjectsProvider } from '@/modules/abplan/projects/infrastructure/ProjectsProvider';
import { actions } from '@/modules/abplan/projects/application/projects.actions';
import { useProjectPersistence } from './useProjectPersistence';
import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_QUERY_KEYS } from '@/api/generated/Project';

interface UpdateProjectParams {
  projectId: string;
  data: UpdateProjectDto;
}

export const useUpdateProject = (projectId?: string) => {
  const dispatch = useAppDispatch();
  const projectsProvider = new ProjectsProvider();
  const { clearTempProject } = useProjectPersistence(projectId);
  const queryClient = useQueryClient();

  return useMutationWithToast<any, Error, UpdateProjectParams>({
    mutationFn: async ({ projectId, data }: UpdateProjectParams) => {
      const project = await projectsProvider.updateProject(projectId, data);
      dispatch(actions.updateProject({ project }));
      return project;
    },
    onSuccess: (project, variables) => {
      // Clear temporary project data after successful update
      clearTempProject();
      
      // Invalidate and refetch the specific project query
      queryClient.invalidateQueries({
        queryKey: [PROJECT_QUERY_KEYS.controllerFindOne, variables.projectId]
      });
      
      // Invalidate the projects list to ensure the updated status is reflected
      queryClient.invalidateQueries({
        queryKey: [PROJECT_QUERY_KEYS.controllerFindAll]
      });
      
      // Also refetch immediately to ensure data is fresh for navigation
      queryClient.refetchQueries({
        queryKey: [PROJECT_QUERY_KEYS.controllerFindOne, variables.projectId]
      });
      
      // Refetch the projects list to update the UI immediately
      queryClient.refetchQueries({
        queryKey: [PROJECT_QUERY_KEYS.controllerFindAll]
      });
    },
    // successMessage: 'Project updated successfully',
    errorMessage: 'Failed to update project',
  });
}; 