import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Project } from '../../domain/entity/project.entity';
import { IProjectRepository } from '../../domain/repository/project-repository.interface';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  private readonly repository: EntityRepository<Project>;
  private readonly em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
    this.repository = em.getRepository(Project);
  }

  async findById(id: string): Promise<Project | null> {
    return this.repository.findOne({ id }, { populate: ['user'] });
  }

  async findByUserId(userId: string): Promise<Project[]> {
    return this.repository.find({ user: userId }, { populate: ['user'] });
  }

  async findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<{ projects: Project[], total: number }> {
    const offset = (page - 1) * limit;
    
    const [projects, total] = await this.repository.findAndCount(
      { user: userId },
      { 
        populate: ['user'],
        limit,
        offset,
        orderBy: { updatedAt: 'DESC' }
      }
    );
    
    return { projects, total };
  }

  async save(project: Project): Promise<Project> {
    await this.em.persistAndFlush(project);
    return project;
  }

  async update(project: Project): Promise<Project> {
    await this.em.flush();
    return project;
  }

  async delete(id: string): Promise<void> {
    const project = await this.findById(id);
    if (project) {
      await this.em.removeAndFlush(project);
    }
  }

  async findAll(): Promise<Project[]> {
    return this.repository.findAll({ populate: ['user'] });
  }
}
