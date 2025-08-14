import { AnalysisResult } from '../../domain/analysis-result.entity';
import { AnalysisResultEntity } from './analysis-result.entity';
import { Project } from '../../../../project/domain/entity/project.entity';
import { wrap } from '@mikro-orm/core';

export class AnalysisResultMapper {
  static toDomain(entity: AnalysisResultEntity): AnalysisResult {
    const project = entity.project.getEntity();
    const analysisResult = new AnalysisResult(
      project,
      entity.rawAnalysis
    );
    
    // Set the ID and timestamps manually since they come from persistence
    (analysisResult as any).id = entity.id;
    (analysisResult as any).createdAt = entity.createdAt;
    
    return analysisResult;
  }

  static toPersistence(domain: AnalysisResult): AnalysisResultEntity {
    const entity = new AnalysisResultEntity();
    entity.id = domain.id;
    entity.project = domain.project;
    entity.rawAnalysis = domain.rawAnalysis;
    entity.createdAt = domain.createdAt;
    
    return entity;
  }
} 