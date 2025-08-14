import { useQuery } from '@tanstack/react-query';
import { AnalysisResult, ANALYSIS_RESULT_QUERY_KEYS, AnalysisResultDto } from '@/api/generated/AnalysisResult';

const analysisResultApi = new AnalysisResult();

export const useLatestAnalysisResult = (projectId: string) => {
  return useQuery<AnalysisResultDto | null>({
    queryKey: [ANALYSIS_RESULT_QUERY_KEYS.getLatestAnalysisResult, projectId],
    queryFn: () => analysisResultApi.getLatestAnalysisResult(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 