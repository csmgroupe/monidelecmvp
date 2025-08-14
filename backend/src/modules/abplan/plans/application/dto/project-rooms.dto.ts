export class ProjectRoomsDto {
  id: string;
  projectId: string;
  rooms: Array<{
    id: string;
    name: string;
    surface: number;
    options?: Record<string, any>;
  }>;
  surfaceLoiCarrez: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateProjectRoomsDto {
  rooms: Array<{
    id: string;
    name: string;
    surface: number;
    options?: Record<string, any>;
  }>;
  surfaceLoiCarrez?: number;
} 