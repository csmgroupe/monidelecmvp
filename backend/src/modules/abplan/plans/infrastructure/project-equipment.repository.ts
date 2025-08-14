import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ProjectEquipmentRepositoryPort } from '../domain/repository/project-equipment-repository.port';
import { ProjectEquipment } from '../domain/project-equipment.entity';

@Injectable()
export class ProjectEquipmentRepository implements ProjectEquipmentRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  async findByProjectId(projectId: string): Promise<ProjectEquipment[]> {
    return await this.em.find(ProjectEquipment, { project: projectId });
  }

  async save(equipment: ProjectEquipment): Promise<ProjectEquipment> {
    await this.em.persistAndFlush(equipment);
    return equipment;
  }

  async saveMany(equipments: ProjectEquipment[]): Promise<ProjectEquipment[]> {
    await this.em.persistAndFlush(equipments);
    return equipments;
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await this.em.nativeDelete(ProjectEquipment, { project: projectId });
  }

  async delete(equipment: ProjectEquipment): Promise<void> {
    await this.em.removeAndFlush(equipment);
  }
} 