import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnalysisResult, ANALYSIS_RESULT_QUERY_KEYS, AnalysisResultDto, SaveUserAdjustmentsDto } from '@/api/generated/AnalysisResult';
import { useMutationWithToast } from '../utils/useMutationWithToast';

const analysisResultApi = new AnalysisResult();

interface SaveUserAdjustmentsParams {
  projectId: string;
  data: SaveUserAdjustmentsDto;
}

export const useSaveUserAdjustments = () => {
  const queryClient = useQueryClient();

  return useMutationWithToast<AnalysisResultDto, Error, SaveUserAdjustmentsParams>({
    mutationFn: async ({ projectId, data }: SaveUserAdjustmentsParams) => {
      return analysisResultApi.saveUserAdjustments(projectId, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the latest analysis result
      queryClient.invalidateQueries({
        queryKey: [ANALYSIS_RESULT_QUERY_KEYS.getLatestAnalysisResult, variables.projectId],
      });
      
      // Invalidate analysis history as well
      queryClient.invalidateQueries({
        queryKey: [ANALYSIS_RESULT_QUERY_KEYS.getAnalysisHistory, variables.projectId],
      });
    },
    successMessage: 'Modifications sauvegardées avec succès',
    errorMessage: 'Erreur lors de la sauvegarde des modifications',
  });
}; 