import { Injectable } from '@nestjs/common';
import { Project } from '../../domain/entity/project.entity';
import { ProjectDto, PlanFileDto } from '../dto/project.dto';
import { PlanFile } from '../../../abplan/plans/domain/plan-file.entity';
import { PlanUploadService } from '../../../abplan/plans/application/usecase/plan-upload.service';

@Injectable()
export class ProjectMapper {
  constructor(private readonly planUploadService: PlanUploadService) {}

  toDto(project: Project, planFiles?: PlanFile[]): ProjectDto {
    const dto = new ProjectDto();
    dto.id = project.id;
    dto.name = project.name;
    dto.description = project.description;
    dto.typeProjet = project.typeProjet;
    dto.typeTravaux = project.typeTravaux;
    dto.codePostal = project.codePostal;
    dto.userId = project.user.unwrap().id;
    dto.planFiles = planFiles?.map(pf => ({
      id: pf.id,
      path: pf.filePath,
      originalName: pf.originalName,
      publicUrl: this.planUploadService.getPublicUrl(pf.filePath)
    })) || [];
    dto.status = project.status;
    dto.createdAt = project.createdAt;
    dto.updatedAt = project.updatedAt;
    dto.number_of_people = project.numberOfPeople;
    dto.dimensioning_data = project.dimensioningData;
    return dto;
  }
} 