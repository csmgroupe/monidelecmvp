import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_ROOMS_QUERY_KEYS } from '@/api/generated/ProjectRooms';
import { PROJECT_EQUIPMENTS_QUERY_KEYS } from '@/api/generated/ProjectEquipments';
import { ANALYSIS_RESULT_QUERY_KEYS } from '@/api/generated/AnalysisResult';
import { useUploadPlan } from './useUploadPlan';
import { usePurgeProjectData } from './usePurgeProjectData';
import { useMutationWithToast } from '../utils/useMutationWithToast';

interface UploadPlanWithPurgeParams {
  file: File;
  projectId: string;
  shouldPurge?: boolean; // Allow opting out of purge for additional plans
  onPurgeComplete?: () => void; // Callback to reset analysis states
}

// Function to clear localStorage for a project
const clearProjectLocalStorage = (projectId: string) => {
  const TEMP_PROJECT_KEY = `abplan_temp_project_${projectId}`;
  try {
    localStorage.removeItem(TEMP_PROJECT_KEY);
    console.log('[useUploadPlanWithPurge] Cleared localStorage for project:', projectId);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

export const useUploadPlanWithPurge = () => {
  const queryClient = useQueryClient();
  const uploadPlanMutation = useUploadPlan();
  const purgeProjectDataMutation = usePurgeProjectData();

  return useMutationWithToast<any, Error, UploadPlanWithPurgeParams>({
    mutationFn: async (params: UploadPlanWithPurgeParams) => {
      const result = await uploadPlanMutation.mutateAsync({
        file: params.file,
        projectId: params.projectId
      });
      
      // Store the shouldPurge and onPurgeComplete in the result for onSuccess
      return {
        ...result,
        shouldPurge: params.shouldPurge,
        onPurgeComplete: params.onPurgeComplete,
        projectId: params.projectId
      };
    },
    onSuccess: async (result) => {
      const { shouldPurge, onPurgeComplete, projectId } = result;
      
      // Purge related data if requested (default true)
      if (shouldPurge !== false) {
        console.log('[useUploadPlanWithPurge] Purging project data for project:', projectId);
        
        // First, purge backend data
        await purgeProjectDataMutation.mutateAsync({
          projectId: projectId,
          purgeRooms: true,
          purgeEquipments: true
        });
        
        // Clear localStorage temporary data
        clearProjectLocalStorage(projectId);
        
        // Clear all related queries to force a fresh start
        console.log('[useUploadPlanWithPurge] Clearing all related query caches');
        
        // Force rooms data to null to trigger auto-analysis
        queryClient.setQueryData(
          [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId],
          null
        );
        
        // Force equipment data to null
        queryClient.setQueryData(
          [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, projectId],
          null
        );
        
        // Clear analysis results as well
        queryClient.setQueryData(
          [ANALYSIS_RESULT_QUERY_KEYS.controllerGetLatestAnalysisResult, projectId],
          null
        );
        
        // Invalidate all related queries to ensure fresh data
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [PROJECT_ROOMS_QUERY_KEYS.controllerGetProjectRooms, projectId]
          }),
          queryClient.invalidateQueries({
            queryKey: [PROJECT_EQUIPMENTS_QUERY_KEYS.getProjectEquipments, projectId]
          }),
          queryClient.invalidateQueries({
            queryKey: [ANALYSIS_RESULT_QUERY_KEYS.controllerGetLatestAnalysisResult, projectId]
          }),
          queryClient.invalidateQueries({
            queryKey: [ANALYSIS_RESULT_QUERY_KEYS.controllerGetAnalysisHistory, projectId]
          })
        ]);
        
        console.log('[useUploadPlanWithPurge] All queries invalidated and data reset');
        
        // Call callback to reset analysis states
        if (onPurgeComplete) {
          onPurgeComplete();
        }
      }
    },
  });
}; 