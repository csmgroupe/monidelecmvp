import { useQueryClient } from '@tanstack/react-query';
import { ProjectEquipments, PROJECT_EQUIPMENTS_QUERY_KEYS, UpdateProjectEquipmentsDto, ProjectEquipmentsResponse } from '@/api/generated/ProjectEquipments';
import { useDebouncedMutation } from '../utils/useDebouncedMutation';

const projectEquipmentsApi = new ProjectEquipments();

interface UpdateProjectOptionsParams {
  data: UpdateProjectEquipmentsDto;
}

export const useDebouncedOptionsUpdate = () => {
  const queryClient = useQueryClient();

  return useDebouncedMutation<ProjectEquipmentsResponse, Error, UpdateProjectOptionsParams>({
    mutationFn: async ({ data }: UpdateProjectOptionsParams) => {
      return await projectEquipmentsApi.projectEquipmentsControllerUpdate(data);
    },
    onMutate: async ({ data }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, data.projectId]
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<ProjectEquipmentsResponse>(
        [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, data.projectId]
      );

      // Optimistically update the cache with the new options (converted to equipments)
      if (previousData) {
        const optimisticData: ProjectEquipmentsResponse = {
          ...previousData,
          equipments: data.equipments
        };
        
        queryClient.setQueryData(
          [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, data.projectId],
          optimisticData
        );
      }

      // Return context object with the snapshotted value
      return { previousData };
    },
    onError: (err, { data }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context && typeof context === 'object' && 'previousData' in context && context.previousData) {
        queryClient.setQueryData(
          [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, data.projectId],
          context.previousData as ProjectEquipmentsResponse
        );
      }
    },
    onSuccess: (responseData) => {
      // Update with the fresh data from the server
      queryClient.setQueryData(
        [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, responseData.projectId],
        responseData
      );
    },
    delay: 1000, // 1 second debounce
  });
}; 