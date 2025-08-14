import { Controller, Get, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectRoomsService } from '../../../application/usecase/project-rooms.service';
import { ProjectRoomsDto, UpdateProjectRoomsDto } from '../../../application/dto/project-rooms.dto';
import { ProjectRoomsDtoMapper } from '../../../application/mapper/project-rooms.mapper';

@Controller('projects/:projectId/rooms')
export class ProjectRoomsController {
  constructor(
    private readonly projectRoomsService: ProjectRoomsService,
  ) {}

  @Get()
  async getProjectRooms(
    @Param('projectId') projectId: string,
  ): Promise<ProjectRoomsDto | null> {
    const result = await this.projectRoomsService.getProjectRooms(projectId);
    return result ? ProjectRoomsDtoMapper.toDto(result) : null;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProjectRooms(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectRoomsDto,
  ): Promise<ProjectRoomsDto> {
    const result = await this.projectRoomsService.updateRooms({
      projectId,
      ...dto,
    });
    return ProjectRoomsDtoMapper.toDto(result);
  }
} 