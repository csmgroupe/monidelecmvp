import { useQuery } from '@tanstack/react-query';
import { AnalysisResult, ANALYSIS_RESULT_QUERY_KEYS, AnalysisResultDto } from '@/api/generated/AnalysisResult';

const analysisResultApi = new AnalysisResult();

export const useAnalysisHistory = (projectId: string) => {
  return useQuery<AnalysisResultDto[]>({
    queryKey: [ANALYSIS_RESULT_QUERY_KEYS.getAnalysisHistory, projectId],
    queryFn: () => analysisResultApi.getAnalysisHistory(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 