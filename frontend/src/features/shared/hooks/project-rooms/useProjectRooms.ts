import { useQuery } from '@tanstack/react-query';
import { ProjectRooms, PROJECT_ROOMS_QUERY_KEYS } from '@/api/generated/ProjectRooms';
import { ProjectRoomsControllerGetProjectRoomsDataContract } from '@/api/generated/data-contracts';

const projectRoomsApi = new ProjectRooms();

export const useProjectRooms = (projectId: string) => {
  return useQuery<ProjectRoomsControllerGetProjectRoomsDataContract | null>({
    queryKey: [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId],
    queryFn: () => projectRoomsApi.projectRoomsControllerGetProjectRooms(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disable automatic polling
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: true, // Keep refetch on reconnect for reliability
  });
}; 