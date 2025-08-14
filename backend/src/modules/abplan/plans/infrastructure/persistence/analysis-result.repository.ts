import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AnalysisResultRepositoryPort } from '../../domain/repository/analysis-result-repository.port';
import { AnalysisResult } from '../../domain/analysis-result.entity';
import { AnalysisResultEntity } from './analysis-result.entity';
import { AnalysisResultMapper } from './analysis-result.mapper';

@Injectable()
export class AnalysisResultRepository implements AnalysisResultRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  async save(analysisResult: AnalysisResult): Promise<AnalysisResult> {
    const entity = AnalysisResultMapper.toPersistence(analysisResult);
    await this.em.persistAndFlush(entity);
    return AnalysisResultMapper.toDomain(entity);
  }



  async findLatestByProjectId(projectId: string): Promise<AnalysisResult | null> {
    const entity = await this.em.findOne(AnalysisResultEntity, {
      project: projectId
    }, {
      populate: ['project'],
      orderBy: { createdAt: 'DESC' }
    });

    return entity ? AnalysisResultMapper.toDomain(entity) : null;
  }

  async findAllByProjectId(projectId: string): Promise<AnalysisResult[]> {
    const entities = await this.em.find(AnalysisResultEntity, {
      project: projectId
    }, {
      populate: ['project'],
      orderBy: { createdAt: 'DESC' }
    });

    return entities.map(entity => AnalysisResultMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(AnalysisResultEntity, { id });
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }
} 