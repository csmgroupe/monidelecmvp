import { Project } from '../entity/project.entity';

export const PROJECT_REPOSITORY_TOKEN = Symbol('IProjectRepository');

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<{ projects: Project[], total: number }>;
  save(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Project[]>;
}
