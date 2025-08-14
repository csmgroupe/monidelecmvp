import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/reduxStore';
import { deleteProject } from '@/modules/abplan/projects/application/use-cases/delete-project';
import { PROJECT_QUERY_KEYS } from '@/api/generated/Project';

export const useDeleteProject = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await dispatch(deleteProject(projectId));
    },
    onSuccess: () => {
      // Invalider et refetch les projets après suppression
      queryClient.invalidateQueries({ queryKey: [PROJECT_QUERY_KEYS.controllerFindAll] });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    },
  });
}; 