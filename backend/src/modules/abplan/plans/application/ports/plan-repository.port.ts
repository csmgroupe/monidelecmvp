import { PlanFile } from '../../domain/plan-file.entity';

export interface PlanRepositoryPort {
  save(planFile: PlanFile): Promise<PlanFile>;
  findById(id: string): Promise<PlanFile | null>;
  findByProjectId(projectId: string): Promise<PlanFile[]>;
  findByHashAndProject(sha256Hash: string, projectId: string): Promise<PlanFile | null>;
  delete(id: string): Promise<void>;
  deleteByFilePath(filePath: string): Promise<void>;
} 