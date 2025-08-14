import { useMutation } from '@tanstack/react-query';
import { ProjectPlans } from '@/api/generated/ProjectPlans';

const projectPlansApi = new ProjectPlans();

interface PurgeProjectDataParams {
  projectId: string;
  purgeRooms?: boolean;
  purgeEquipments?: boolean;
}

export const usePurgeProjectData = () => {
  return useMutation<void, Error, PurgeProjectDataParams>({
    mutationFn: async ({ projectId }: PurgeProjectDataParams) => {
      console.log('[usePurgeProjectData] Purging project data using backend endpoint for project:', projectId);
      
      // Use the new backend purge endpoint
      await projectPlansApi.projectPlansControllerPurgeProjectData(projectId);
      
      console.log('[usePurgeProjectData] Successfully purged project data using backend endpoint');
    },
  });
}; 