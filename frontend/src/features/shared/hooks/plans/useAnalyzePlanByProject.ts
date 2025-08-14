import { useAppDispatch } from '@/store/reduxStore';
import { analyzeByProject } from '@/modules/abplan/plans/application/use-cases/analyze-by-project';
import { useMutationWithToast } from '../utils/useMutationWithToast';

interface AnalyzeByProjectParams {
  projectId: string;
}

interface AnalysisResult {
  rooms: Array<{
    id: number;
    name: string;
    surface: number;
    options?: Record<string, any>;
  }>;
  surface_loi_carrez?: number;
}

export const useAnalyzePlanByProject = () => {
  const dispatch = useAppDispatch();

  return useMutationWithToast<AnalysisResult, Error, AnalyzeByProjectParams>({
    mutationFn: async (params: AnalyzeByProjectParams) => {
      const result = await dispatch(analyzeByProject(params));
      return result as AnalysisResult;
    },
    errorMessage: `Erreur lors de l'analyse du plan`,
  });
}; 