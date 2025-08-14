import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectPlans, PROJECT_PLANS_QUERY_KEYS } from '@/api/generated/ProjectPlans';
import { PROJECT_ROOMS_QUERY_KEYS } from '@/api/generated/ProjectRooms';
import { PROJECT_EQUIPMENTS_QUERY_KEYS } from '@/api/generated/ProjectEquipments';
import { ANALYSIS_RESULT_QUERY_KEYS } from '@/api/generated/AnalysisResult';
import { useMutationWithToast } from '../utils/useMutationWithToast';
import { usePurgeProjectData } from './usePurgeProjectData';

const projectPlansApi = new ProjectPlans();

interface DeletePlanWithPurgeParams {
  projectId: string;
  planId: string;
}

// Function to clear localStorage for a project
const clearProjectLocalStorage = (projectId: string) => {
  const TEMP_PROJECT_KEY = `abplan_temp_project_${projectId}`;
  try {
    localStorage.removeItem(TEMP_PROJECT_KEY);
    console.log('[useDeletePlanWithPurge] Cleared localStorage for project:', projectId);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

export const useDeletePlanWithPurge = () => {
  const queryClient = useQueryClient();
  const purgeProjectDataMutation = usePurgeProjectData();

  return useMutationWithToast<void, Error, DeletePlanWithPurgeParams>({
    mutationFn: async ({ projectId, planId }: DeletePlanWithPurgeParams) => {
      // Delete the plan via API
      await projectPlansApi.projectPlansControllerDeletePlan(projectId, planId);
    },
    onSuccess: async (_, { projectId }) => {
      console.log('[useDeletePlanWithPurge] Plan deleted, purging project data for project:', projectId);
      
      // Invalidate plans queries to trigger refresh
      queryClient.invalidateQueries({
        queryKey: [PROJECT_PLANS_QUERY_KEYS.controllerGetPlans, projectId]
      });
      
      // First, purge backend data
      await purgeProjectDataMutation.mutateAsync({
        projectId,
        purgeRooms: true,
        purgeEquipments: true
      });
      
      // Clear localStorage temporary data
      clearProjectLocalStorage(projectId);
      
      // Clear all related queries to force a fresh start
      console.log('[useDeletePlanWithPurge] Clearing all related query caches');
      
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
      
      console.log('[useDeletePlanWithPurge] All queries invalidated and data reset');
    },
    errorMessage: 'Erreur lors de la suppression du plan',
  });
}; 