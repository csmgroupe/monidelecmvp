import { Controller, Get, Put, Param, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ProjectEquipmentService } from '../application/usecase/project-equipment.service';
import { UpdateProjectEquipmentsDto, ProjectEquipmentsResponseDto } from '../application/dto/project-equipment.dto';
import { ProjectEquipmentMapper } from '../application/mapper/project-equipment.mapper';

@Controller('project-equipments')
export class ProjectEquipmentController {
  constructor(private readonly projectEquipmentService: ProjectEquipmentService) {}

  @Get(':projectId')
  async getProjectEquipments(@Param('projectId') projectId: string): Promise<ProjectEquipmentsResponseDto> {
    const equipments = await this.projectEquipmentService.getProjectEquipments(projectId);
    return ProjectEquipmentMapper.toResponseDto(projectId, equipments);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProjectEquipments(@Body() dto: UpdateProjectEquipmentsDto): Promise<ProjectEquipmentsResponseDto> {
    const equipments = await this.projectEquipmentService.updateProjectEquipments(dto);
    return ProjectEquipmentMapper.toResponseDto(dto.projectId, equipments);
  }
} 