import { ProjectEquipment } from '../project-equipment.entity';

export interface ProjectEquipmentRepositoryPort {
  findByProjectId(projectId: string): Promise<ProjectEquipment[]>;
  save(equipment: ProjectEquipment): Promise<ProjectEquipment>;
  saveMany(equipments: ProjectEquipment[]): Promise<ProjectEquipment[]>;
  deleteByProjectId(projectId: string): Promise<void>;
  delete(equipment: ProjectEquipment): Promise<void>;
} 