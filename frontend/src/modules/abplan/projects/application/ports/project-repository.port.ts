import { Project, CreateProjectDto, UpdateProjectDto } from '../../domain/project.entity';

export interface ProjectGateway {
  create(createDto: CreateProjectDto): Promise<Project>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(id: string, updateDto: UpdateProjectDto): Promise<Project>;
  delete(id: string): Promise<void>;
} 