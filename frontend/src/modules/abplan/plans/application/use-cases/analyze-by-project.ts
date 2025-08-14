import { AppThunk } from '@/store/reduxStore';

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

export const analyzeByProject: (params: AnalyzeByProjectParams) => AppThunk =
  ({ projectId }) =>
  async (dispatch, _getState) => {
    // Analyze all plans for the project
    const result = await fetch(`/api/v1/projects/${projectId}/plans/analyze-all`, {
      method: 'POST',
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Analysis failed: ${res.statusText}`);
      }
      return res.json();
    });
    
    const analysisResult = result as AnalysisResult;
    return analysisResult;
  }; 