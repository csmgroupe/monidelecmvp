import { Injectable, Inject } from '@nestjs/common';
import { ProjectRoomsRepositoryPort } from '../../domain/repository/project-rooms-repository.port';
import { ProjectRooms } from '../../domain/project-rooms.entity';
import { Project } from '../../../../project/domain/entity/project.entity';

export interface UpdateProjectRoomsDto {
  projectId: string;
  rooms: Array<{
    id: string;
    name: string;
    surface: number;
    options?: Record<string, any>;
  }>;
  surfaceLoiCarrez?: number;
}

@Injectable()
export class ProjectRoomsService {
  constructor(
    @Inject('ProjectRoomsRepositoryPort') 
    private readonly projectRoomsRepository: ProjectRoomsRepositoryPort,
  ) {}

  /**
   * Initialize project rooms from AI analysis (first time only)
   */
  async initializeFromAnalysis(
    project: Project, 
    analysisResult: any
  ): Promise<ProjectRooms> {
    // Check if project rooms already exist
    const existingRooms = await this.projectRoomsRepository.findByProjectId(project.id);
    
    if (existingRooms) {
      // Don't overwrite existing user configuration
      return existingRooms;
    }

    // Create initial project rooms from AI analysis
    const projectRooms = ProjectRooms.createFromAnalysis(project, analysisResult);
    return await this.projectRoomsRepository.save(projectRooms);
  }

  /**
   * Update project rooms with user modifications
   */
  async updateRooms(dto: UpdateProjectRoomsDto): Promise<ProjectRooms> {
    const projectRooms = await this.projectRoomsRepository.findByProjectId(dto.projectId);
    
    if (!projectRooms) {
      throw new Error('No room configuration found for this project. Please run analysis first.');
    }

    // Calculate total surface from all rooms
    const totalSurface = dto.rooms.reduce((acc, room) => acc + room.surface, 0);

    // Update with user modifications, using calculated total surface
    projectRooms.updateRooms(dto.rooms, totalSurface);
    
    return await this.projectRoomsRepository.save(projectRooms);
  }

  /**
   * Get project rooms for a project
   */
  async getProjectRooms(projectId: string): Promise<ProjectRooms | null> {
    return await this.projectRoomsRepository.findByProjectId(projectId);
  }

  /**
   * Delete project rooms
   */
  async deleteProjectRooms(id: string): Promise<void> {
    await this.projectRoomsRepository.delete(id);
  }
} 