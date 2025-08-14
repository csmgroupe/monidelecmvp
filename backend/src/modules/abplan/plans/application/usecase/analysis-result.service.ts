import { Injectable, Inject } from '@nestjs/common';
import { AnalysisResultRepositoryPort } from '../../domain/repository/analysis-result-repository.port';
import { AnalysisResult } from '../../domain/analysis-result.entity';
import { Project } from '../../../../project/domain/entity/project.entity';
import { FloorPlanAnalysis } from '@/baml_client';

@Injectable()
export class AnalysisResultService {
  constructor(
    @Inject('AnalysisResultRepositoryPort') 
    private readonly analysisResultRepository: AnalysisResultRepositoryPort,
  ) {}

  /**
   * Auto-save analysis result from BAML analysis
   * This is called automatically after each analysis without frontend trigger
   */
  async autoSaveAnalysisResult(
    project: Project, 
    bamlAnalysis: FloorPlanAnalysis
  ): Promise<AnalysisResult> {
    const analysisResult = AnalysisResult.createFromBamlAnalysis(project, bamlAnalysis);
    return await this.analysisResultRepository.save(analysisResult);
  }

  /**
   * Get the latest analysis result for a project
   */
  async getLatestAnalysisResult(projectId: string): Promise<AnalysisResult | null> {
    return await this.analysisResultRepository.findLatestByProjectId(projectId);
  }

  /**
   * Get all analysis results for a project (history)
   */
  async getAnalysisHistory(projectId: string): Promise<AnalysisResult[]> {
    return await this.analysisResultRepository.findAllByProjectId(projectId);
  }

  /**
   * Delete an analysis result
   */
  async deleteAnalysisResult(id: string): Promise<void> {
    await this.analysisResultRepository.delete(id);
  }
} 