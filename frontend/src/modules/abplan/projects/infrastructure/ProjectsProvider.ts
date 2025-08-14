import { Project } from '@/api/generated/Project';
import { CreateProjectDtoContract } from '@/api/generated/data-contracts';
import { ProjectsGateway } from '../application/projects.gateway';
import { CreateProjectDto, UpdateProjectDto, Project as ProjectEntity } from '../domain/project.entity';

const projectClient = new Project();

export class ProjectsProvider implements ProjectsGateway {
  private mapToBackendFormat(data: CreateProjectDto | UpdateProjectDto | Partial<CreateProjectDto | UpdateProjectDto>) {
    const { numberOfPeople, dimensioning, ...rest } = data;
    const result: any = {
      ...rest,
      ...(numberOfPeople !== undefined && { number_of_people: numberOfPeople }),
      ...(dimensioning !== undefined && { dimensioning_data: dimensioning })
    };
    
    // Ajouter le status seulement s'il est présent (pour UpdateProjectDto)
    if ('status' in data && data.status !== undefined) {
      result.status = data.status;
    }
    
    return result;
  }

  private mapFromBackendFormat(data: any): ProjectEntity {
    const { number_of_people, dimensioning_data, status, ...rest } = data;
    return {
      ...rest,
      ...(number_of_people !== undefined && { numberOfPeople: number_of_people }),
      ...(dimensioning_data !== undefined && { dimensioning: dimensioning_data }),
      ...(status !== undefined && { status })
    };
  }

  async createProject(data: CreateProjectDto): Promise<ProjectEntity> {
    const backendData = this.mapToBackendFormat(data);
    const response = await projectClient.projectControllerCreate(backendData as CreateProjectDtoContract);
    return this.mapFromBackendFormat(response);
  }

  async getProjects(page: number = 1, limit: number = 10): Promise<{ projects: ProjectEntity[], total: number, page: number, totalPages: number }> {
    // Utilisation directe de fetch pour contourner le problème de l'API générée
    const response = await fetch(`/api/v1/projects?page=${page}&limit=${limit}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      projects: data.projects.map((project: any) => this.mapFromBackendFormat(project))
    };
  }

  async getProject(id: string): Promise<ProjectEntity> {
    const response = await projectClient.projectControllerFindOne(id);
    return this.mapFromBackendFormat(response);
  }

  async updateProject(id: string, data: Partial<CreateProjectDto | UpdateProjectDto>): Promise<ProjectEntity> {
    const backendData = this.mapToBackendFormat(data);
    const response = await projectClient.projectControllerUpdate(id, backendData as CreateProjectDtoContract);
    return this.mapFromBackendFormat(response);
  }

  async deleteProject(id: string): Promise<void> {
    await projectClient.projectControllerRemove(id);
  }
} 