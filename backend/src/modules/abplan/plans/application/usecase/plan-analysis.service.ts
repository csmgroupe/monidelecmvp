import { Injectable, Inject } from '@nestjs/common';
import { AiAnalysisPort } from '../ports/ai-analysis.port';
import { FileStoragePort } from '../ports/file-storage.port';
import { PlanRepositoryPort } from '../ports/plan-repository.port';
import { FloorPlanAnalysis } from '@/baml_client';
import { AnalysisResultService } from './analysis-result.service';
import { ProjectRoomsService } from './project-rooms.service';
import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from '../../../../project/domain/repository/project-repository.interface';

@Injectable()
export class PlanAnalysisService {
  constructor(
    @Inject('AiAnalysisPort') private readonly aiAnalysisPort: AiAnalysisPort,
    @Inject('FileStoragePort') private readonly fileStoragePort: FileStoragePort,
    @Inject('PlanRepositoryPort') private readonly planRepositoryPort: PlanRepositoryPort,
    @Inject(PROJECT_REPOSITORY_TOKEN) private readonly projectRepository: IProjectRepository,
    private readonly analysisResultService: AnalysisResultService,
    private readonly projectRoomsService: ProjectRoomsService,
  ) {}

  async analyzeAllProjectPlans(projectId: string): Promise<FloorPlanAnalysis> {
    const planFiles = await this.planRepositoryPort.findByProjectId(projectId);
    
    if (planFiles.length === 0) {
      throw new Error('No plans found for this project');
    }

    // Get the project entity
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get public URLs for all plans
    const imageUrls = planFiles.map(planFile => 
      this.fileStoragePort.getPublicUrl('plans', planFile.filePath)
    );

    // Perform the analysis
    const analysisResult = await this.aiAnalysisPort.analyzeMultiplePlans(imageUrls);

    // Auto-save the analysis result (without frontend trigger)
    await this.analysisResultService.autoSaveAnalysisResult(project, analysisResult);

    // Initialize project rooms from analysis result (only if not already exists)
    await this.projectRoomsService.initializeFromAnalysis(project, analysisResult);

    return analysisResult;  
  }
}
