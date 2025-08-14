import { CreateProjectDto, Project } from '../domain/project.entity';

export interface ProjectsGateway {
  createProject(data: CreateProjectDto): Promise<Project>;
  getProjects(page?: number, limit?: number): Promise<{ projects: Project[], total: number, page: number, totalPages: number }>;
  getProject(id: string): Promise<Project>;
  updateProject(id: string, data: Partial<CreateProjectDto>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
} 