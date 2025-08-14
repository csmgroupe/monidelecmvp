import { AnalysisResult } from '../analysis-result.entity';

export interface AnalysisResultRepositoryPort {
  save(analysisResult: AnalysisResult): Promise<AnalysisResult>;
  findLatestByProjectId(projectId: string): Promise<AnalysisResult | null>;
  findAllByProjectId(projectId: string): Promise<AnalysisResult[]>;
  delete(id: string): Promise<void>;
} 