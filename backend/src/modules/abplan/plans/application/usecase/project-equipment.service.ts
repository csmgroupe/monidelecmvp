import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProjectEquipmentRepositoryPort } from '../../domain/repository/project-equipment-repository.port';
import { ProjectEquipment } from '../../domain/project-equipment.entity';
import { Project } from '../../../../project/domain/entity/project.entity';
import { UpdateProjectEquipmentsDto, ProjectEquipmentDto } from '../dto/project-equipment.dto';
import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from '../../../../project/domain/repository/project-repository.interface';

@Injectable()
export class ProjectEquipmentService {
  constructor(
    @Inject('ProjectEquipmentRepositoryPort')
    private readonly projectEquipmentRepository: ProjectEquipmentRepositoryPort,
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async getProjectEquipments(projectId: string): Promise<ProjectEquipment[]> {
    // Verify project exists
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return await this.projectEquipmentRepository.findByProjectId(projectId);
  }

  async updateProjectEquipments(dto: UpdateProjectEquipmentsDto): Promise<ProjectEquipment[]> {
    // Verify project exists
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
    }

    // Delete existing equipments for this project
    await this.projectEquipmentRepository.deleteByProjectId(dto.projectId);

    // Create new equipments
    const equipments = dto.equipments.map(equipmentDto => {
      return new ProjectEquipment({
        name: equipmentDto.name,
        quantity: equipmentDto.quantity,
        roomId: equipmentDto.roomId,
        category: equipmentDto.category,
        type: equipmentDto.type,
        metadata: equipmentDto.metadata,
        project: project,
      });
    });

    return await this.projectEquipmentRepository.saveMany(equipments);
  }
} 