import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectRooms, PROJECT_ROOMS_QUERY_KEYS } from '@/api/generated/ProjectRooms';
import { 
  ProjectRoomsControllerGetProjectRoomsDataContract,
  ProjectRoomsControllerUpdateProjectRoomsDataContract, 
  UpdateProjectRoomsDtoContract 
} from '@/api/generated/data-contracts';
import { useMutationWithToast } from '../utils/useMutationWithToast';

const projectRoomsApi = new ProjectRooms();

interface UpdateProjectRoomsParams {
  projectId: string;
  data: UpdateProjectRoomsDtoContract;
}

export const useUpdateProjectRooms = () => {
  const queryClient = useQueryClient();

  return useMutationWithToast<ProjectRoomsControllerUpdateProjectRoomsDataContract, Error, UpdateProjectRoomsParams>({
    mutationFn: async ({ projectId, data }: UpdateProjectRoomsParams) => {
      return projectRoomsApi.projectRoomsControllerUpdateProjectRooms(projectId, data);
    },
    onSuccess: (data, variables) => {
      // Update the cached project rooms data
      queryClient.setQueryData(
        [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, variables.projectId],
        data
      );
    },
    // Don't show toast for auto-saves to avoid spam
    successMessage: undefined,
    errorMessage: 'Erreur lors de la sauvegarde des modifications',
  });
};

// Silent version for auto-save (no toast notifications)
export const useUpdateProjectRoomsSilent = () => {
  const queryClient = useQueryClient();

  return useMutation<ProjectRoomsControllerUpdateProjectRoomsDataContract, Error, UpdateProjectRoomsParams>({
    mutationFn: async ({ projectId, data }: UpdateProjectRoomsParams) => {
      return projectRoomsApi.projectRoomsControllerUpdateProjectRooms(projectId, data);
    },
    onSuccess: (data, variables) => {
      // Update the cached project rooms data
      queryClient.setQueryData(
        [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, variables.projectId],
        data
      );
    },
    onError: (error) => {
      console.error('Failed to auto-save project rooms:', error);
    },
  });
}; 