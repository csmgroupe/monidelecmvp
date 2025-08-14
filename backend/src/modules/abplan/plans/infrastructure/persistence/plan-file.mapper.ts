import { PlanFile } from '../../domain/plan-file.entity';
import { PlanFileEntity } from './plan-file.entity';
import { Project } from '../../../../project/domain/entity/project.entity';

export class PlanFileMapper {
  static toDomain(entity: PlanFileEntity): PlanFile {
    return new PlanFile(
      entity.id,
      entity.originalName,
      entity.filePath,
      entity.contentType,
      entity.size,
      entity.createdAt,
      entity.sha256Hash,
      entity.project?.getEntity().id,
    );
  }

  static toEntity(domain: PlanFile, project?: Project): PlanFileEntity {
    return new PlanFileEntity(
      domain.originalName,
      domain.filePath,
      domain.contentType,
      domain.size,
      domain.sha256Hash,
      project,
    );
  }
} 