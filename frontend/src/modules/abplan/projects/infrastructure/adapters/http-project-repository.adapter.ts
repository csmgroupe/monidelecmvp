import { ProjectGateway } from '../../application/ports/project-repository.port';
import { Project, CreateProjectDto, UpdateProjectDto } from '../../domain/project.entity';

export class HttpProjectRepositoryAdapter implements ProjectGateway {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async create(createDto: CreateProjectDto): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`);
    }

    return response.json();
  }

  async findAll(): Promise<Project[]> {
    const response = await fetch(`${this.baseUrl}/projects`);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const result = await response.json();
    return result.projects || [];
  }

  async findById(id: string): Promise<Project | null> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    return response.json();
  }

  async update(id: string, updateDto: UpdateProjectDto): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDto),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }
  }
} 