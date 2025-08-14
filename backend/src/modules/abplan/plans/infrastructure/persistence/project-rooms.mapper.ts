import { ProjectRooms } from '../../domain/project-rooms.entity';
import { ProjectRoomsEntity } from './project-rooms.entity';
import { Project } from '../../../../project/domain/entity/project.entity';

export class ProjectRoomsMapper {
  static toDomain(entity: ProjectRoomsEntity): ProjectRooms {
    const project = entity.project.getEntity();
    const projectRooms = new ProjectRooms(
      project,
      entity.rooms,
      entity.surfaceLoiCarrez
    );
    
    // Set the ID and timestamps manually since they come from persistence
    (projectRooms as any).id = entity.id;
    (projectRooms as any).createdAt = entity.createdAt;
    (projectRooms as any).updatedAt = entity.updatedAt;
    
    return projectRooms;
  }

  static toPersistence(domain: ProjectRooms): ProjectRoomsEntity {
    const entity = new ProjectRoomsEntity();
    entity.id = domain.id;
    entity.project = domain.project;
    entity.rooms = domain.rooms;
    entity.surfaceLoiCarrez = domain.surfaceLoiCarrez;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    
    return entity;
  }
} 