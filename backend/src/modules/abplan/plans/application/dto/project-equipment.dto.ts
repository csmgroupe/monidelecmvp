import { IsString, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';
import { EquipmentCategory } from '../../domain/project-equipment.entity';

export class ProjectEquipmentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsEnum(['equipment', 'option'])
  category: EquipmentCategory;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateProjectEquipmentsDto {
  @IsString()
  projectId: string;

  equipments: ProjectEquipmentDto[];
}

export class ProjectEquipmentsResponseDto {
  projectId: string;
  equipments: ProjectEquipmentDto[];
  createdAt: string;
  updatedAt: string;
} 