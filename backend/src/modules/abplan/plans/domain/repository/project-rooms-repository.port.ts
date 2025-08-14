import { ProjectRooms } from '../project-rooms.entity';

export interface ProjectRoomsRepositoryPort {
  save(projectRooms: ProjectRooms): Promise<ProjectRooms>;
  findByProjectId(projectId: string): Promise<ProjectRooms | null>;
  delete(id: string): Promise<void>;
} 