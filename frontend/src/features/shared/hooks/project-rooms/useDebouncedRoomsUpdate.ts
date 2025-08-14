import { useQueryClient } from '@tanstack/react-query';
import { ProjectRooms, PROJECT_ROOMS_QUERY_KEYS } from '@/api/generated/ProjectRooms';
import { 
  ProjectRoomsControllerGetProjectRoomsDataContract, 
  ProjectRoomsControllerUpdateProjectRoomsDataContract,
  UpdateProjectRoomsDtoContract 
} from '@/api/generated/data-contracts';
import { useDebouncedMutation } from '../utils/useDebouncedMutation';

const projectRoomsApi = new ProjectRooms();

interface UpdateProjectRoomsParams {
  projectId: string;
  data: UpdateProjectRoomsDtoContract;
}

export const useDebouncedRoomsUpdate = () => {
  const queryClient = useQueryClient();

  return useDebouncedMutation<ProjectRoomsControllerUpdateProjectRoomsDataContract, Error, UpdateProjectRoomsParams>({
    mutationFn: async ({ projectId, data }: UpdateProjectRoomsParams) => {
      return projectRoomsApi.projectRoomsControllerUpdateProjectRooms(projectId, data);
    },
    onMutate: async ({ projectId, data }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId]
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<ProjectRoomsControllerGetProjectRoomsDataContract>(
        [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId]
      );

      // Optimistically update the cache
      if (previousData && typeof previousData === 'object') {
        const optimisticData: ProjectRoomsControllerGetProjectRoomsDataContract = {
          ...previousData,
          ...(data as any) // Since UpdateProjectRoomsDtoContract is object type, we cast it
        };
        
        queryClient.setQueryData(
          [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId],
          optimisticData
        );
      }

      // Return context object with the snapshotted value
      return { previousData };
    },
    onError: (err, { projectId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context && typeof context === 'object' && 'previousData' in context && context.previousData) {
        queryClient.setQueryData(
          [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId],
          context.previousData as ProjectRoomsControllerGetProjectRoomsDataContract
        );
      }
    },
    onSuccess: (responseData, { projectId }) => {
      // Update with the fresh data from the server
      queryClient.setQueryData(
        [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId],
        responseData
      );
    },
    delay: 1000, // 1 second debounce
  });
}; 