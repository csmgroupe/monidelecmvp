import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectEquipments, PROJECT_EQUIPMENTS_QUERY_KEYS, UpdateProjectEquipmentsDto, ProjectEquipmentsResponse } from '@/api/generated/ProjectEquipments';
import { useMutationWithToast } from '../utils/useMutationWithToast';

const projectEquipmentsApi = new ProjectEquipments();

interface UpdateProjectEquipmentsParams {
  data: UpdateProjectEquipmentsDto;
}

export const useUpdateProjectEquipments = () => {
  const queryClient = useQueryClient();

  return useMutationWithToast<ProjectEquipmentsResponse, Error, UpdateProjectEquipmentsParams>({
    mutationFn: async ({ data }: UpdateProjectEquipmentsParams) => {
      return await projectEquipmentsApi.projectEquipmentsControllerUpdate(data);
    },
    onSuccess: (responseData) => {
      // Update the cache directly instead of invalidating to prevent race conditions
      queryClient.setQueryData(
        [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, responseData.projectId],
        responseData
      );
    },
    successMessage: 'Équipements sauvegardés avec succès',
    errorMessage: 'Erreur lors de la sauvegarde des équipements',
  });
};

// Silent version without toast notifications
export const useUpdateProjectEquipmentsSilent = () => {
  const queryClient = useQueryClient();

  return useMutation<ProjectEquipmentsResponse, Error, UpdateProjectEquipmentsParams>({
    mutationFn: async ({ data }: UpdateProjectEquipmentsParams) => {
      return await projectEquipmentsApi.projectEquipmentsControllerUpdate(data);
    },
    onSuccess: (responseData) => {
      // Update the cache directly instead of invalidating to prevent race conditions
      queryClient.setQueryData(
        [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, responseData.projectId],
        responseData
      );
    },
  });
}; 