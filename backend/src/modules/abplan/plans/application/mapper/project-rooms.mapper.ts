import { ProjectRooms } from '../../domain/project-rooms.entity';
import { ProjectRoomsDto } from '../dto/project-rooms.dto';

export class ProjectRoomsDtoMapper {
  static toDto(domain: ProjectRooms): ProjectRoomsDto {
    return {
      id: domain.id,
      projectId: domain.project.getEntity().id,
      rooms: domain.rooms,
      surfaceLoiCarrez: domain.surfaceLoiCarrez,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
} 