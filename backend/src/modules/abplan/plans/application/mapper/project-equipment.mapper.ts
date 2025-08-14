import { ProjectEquipment } from '../../domain/project-equipment.entity';
import { ProjectEquipmentDto, ProjectEquipmentsResponseDto } from '../dto/project-equipment.dto';

export class ProjectEquipmentMapper {
  static toDto(equipment: ProjectEquipment): ProjectEquipmentDto {
    return {
      id: equipment.id,
      name: equipment.name,
      quantity: equipment.quantity,
      roomId: equipment.roomId,
      category: equipment.category,
      type: equipment.type,
      metadata: equipment.metadata,
    };
  }

  static toDtoArray(equipments: ProjectEquipment[]): ProjectEquipmentDto[] {
    return equipments.map(equipment => this.toDto(equipment));
  }

  static toResponseDto(projectId: string, equipments: ProjectEquipment[]): ProjectEquipmentsResponseDto {
    const firstEquipment = equipments[0];
    return {
      projectId,
      equipments: this.toDtoArray(equipments),
      createdAt: firstEquipment?.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: firstEquipment?.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
} 