import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PlanRepositoryPort } from '../../../application/ports/plan-repository.port';
import { PlanFile } from '../../../domain/plan-file.entity';
import { PlanFileEntity } from '../../persistence/plan-file.entity';
import { PlanFileMapper } from '../../persistence/plan-file.mapper';
import { Project } from '../../../../../project/domain/entity/project.entity';

@Injectable()
export class SupabasePlanRepositoryAdapter implements PlanRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  async save(planFile: PlanFile): Promise<PlanFile> {
    console.log(`[SupabasePlanRepository] Saving plan file with projectId: ${planFile.projectId}`);
    let project: Project | undefined;
    
    if (planFile.projectId) {
      const foundProject = await this.em.findOne(Project, { id: planFile.projectId });
      if (!foundProject) {
        throw new Error(`Project with id ${planFile.projectId} not found`);
      }
      project = foundProject;
      console.log(`[SupabasePlanRepository] Found project: ${project.id} - ${project.name}`);
    }

    const entity = PlanFileMapper.toEntity(planFile, project);
    entity.id = planFile.id;
    
    await this.em.persistAndFlush(entity);
    console.log(`[SupabasePlanRepository] Saved plan file entity: ${entity.id} with project: ${entity.project?.unwrap()?.id}`);
    
    return PlanFileMapper.toDomain(entity);
  }

  async findById(id: string): Promise<PlanFile | null> {
    const entity = await this.em.findOne(PlanFileEntity, { id }, {
      populate: ['project']
    });
    
    return entity ? PlanFileMapper.toDomain(entity) : null;
  }

  async findByProjectId(projectId: string): Promise<PlanFile[]> {
    console.log(`[SupabasePlanRepository] Finding plan files for projectId: ${projectId}`);
    const entities = await this.em.find(PlanFileEntity, {
      project: { id: projectId }
    }, {
      populate: ['project']
    });
    console.log(`[SupabasePlanRepository] Found ${entities.length} entities:`, entities.map(e => ({ id: e.id, filePath: e.filePath, projectId: e.project?.unwrap()?.id })));
    
    return entities.map(entity => PlanFileMapper.toDomain(entity));
  }

  async findByHashAndProject(sha256Hash: string, projectId: string): Promise<PlanFile | null> {
    console.log(`[SupabasePlanRepository] Checking for duplicate file with hash: ${sha256Hash} in project: ${projectId}`);
    const entity = await this.em.findOne(PlanFileEntity, {
      sha256Hash,
      project: { id: projectId }
    }, {
      populate: ['project']
    });
    
    return entity ? PlanFileMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(PlanFileEntity, { id });
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }

  async deleteByFilePath(filePath: string): Promise<void> {
    const entity = await this.em.findOne(PlanFileEntity, { filePath });
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }
} 