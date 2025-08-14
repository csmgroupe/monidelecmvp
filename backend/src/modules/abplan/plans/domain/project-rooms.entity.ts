import { Reference, wrap } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { Project } from '../../../project/domain/entity/project.entity';

export class ProjectRooms {
  id: string = uuidv7();
  project: Reference<Project>;
  rooms: Array<{
    id: string;
    name: string;
    surface: number;
    options?: Record<string, any>;
  }>;
  surfaceLoiCarrez: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(
    project: Project,
    rooms: Array<{ id: string; name: string; surface: number; options?: Record<string, any> }>,
    surfaceLoiCarrez: number
  ) {
    this.project = wrap(project).toReference();
    this.rooms = rooms;
    this.surfaceLoiCarrez = surfaceLoiCarrez;
  }

  static createFromAnalysis(
    project: Project,
    analysisResult: any
  ): ProjectRooms {
    const rooms = analysisResult.rooms.map((room: any) => ({
      id: uuidv7(),
      name: room.name,
      surface: room.surface,
      options: {}
    }));

    // Calculate total surface from all rooms instead of using Loi Carrez from analysis
    const totalSurface = rooms.reduce((acc, room) => acc + room.surface, 0);

    return new ProjectRooms(
      project,
      rooms,
      totalSurface
    );
  }

  updateRooms(
    rooms: Array<{ id: string; name: string; surface: number; options?: Record<string, any> }>,
    surfaceLoiCarrez?: number
  ): void {
    this.rooms = rooms;
    if (surfaceLoiCarrez !== undefined) {
      this.surfaceLoiCarrez = surfaceLoiCarrez;
    }
    this.updatedAt = new Date();
  }
} 