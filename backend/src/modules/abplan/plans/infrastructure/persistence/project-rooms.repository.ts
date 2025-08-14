import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ProjectRoomsRepositoryPort } from '../../domain/repository/project-rooms-repository.port';
import { ProjectRooms } from '../../domain/project-rooms.entity';
import { ProjectRoomsEntity } from './project-rooms.entity';
import { ProjectRoomsMapper } from './project-rooms.mapper';

@Injectable()
export class ProjectRoomsRepository implements ProjectRoomsRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  async save(projectRooms: ProjectRooms): Promise<ProjectRooms> {
    // Check if project rooms already exist for this project
    const existingEntity = await this.em.findOne(ProjectRoomsEntity, {
      project: projectRooms.project.getEntity().id
    });

    if (existingEntity) {
      // Update existing entity
      existingEntity.rooms = projectRooms.rooms;
      existingEntity.surfaceLoiCarrez = projectRooms.surfaceLoiCarrez;
      existingEntity.updatedAt = new Date();
      
      await this.em.flush();
      return ProjectRoomsMapper.toDomain(existingEntity);
    } else {
      // Create new entity
      const entity = ProjectRoomsMapper.toPersistence(projectRooms);
      await this.em.persistAndFlush(entity);
      return ProjectRoomsMapper.toDomain(entity);
    }
  }

  async findByProjectId(projectId: string): Promise<ProjectRooms | null> {
    const entity = await this.em.findOne(ProjectRoomsEntity, {
      project: projectId
    }, {
      populate: ['project']
    });

    return entity ? ProjectRoomsMapper.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(ProjectRoomsEntity, { id });
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }
} 