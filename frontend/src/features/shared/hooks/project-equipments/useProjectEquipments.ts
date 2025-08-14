import { useQuery } from '@tanstack/react-query';
import { ProjectEquipments, PROJECT_EQUIPMENTS_QUERY_KEYS, ProjectEquipmentsResponse } from '@/api/generated/ProjectEquipments';

const projectEquipmentsApi = new ProjectEquipments();

export const useProjectEquipments = (projectId: string, options?: { enabled?: boolean }) => {
  return useQuery<ProjectEquipmentsResponse>({
    queryKey: [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      return await projectEquipmentsApi.projectEquipmentsControllerGet(projectId);
    },
    enabled: !!projectId && options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Disable automatic polling
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: true, // Keep refetch on reconnect for reliability
  });
}; 