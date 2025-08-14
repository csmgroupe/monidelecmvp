import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PlanUploadController } from './infrastructure/adapters/in/plan-upload.controller';
import { ProjectPlansController } from './infrastructure/adapters/in/project-plans.controller';
import { AnalysisResultController } from './infrastructure/adapters/in/analysis-result.controller';
import { ProjectRoomsController } from './infrastructure/adapters/in/project-rooms.controller';
import { ProjectEquipmentController } from './infrastructure/project-equipment.controller';
import { SupabaseStorageAdapter } from './infrastructure/adapters/out/supabase-storage.adapter';
import { SupabasePlanRepositoryAdapter } from './infrastructure/adapters/out/supabase-plan-repository.adapter';
import { BamlAnalysisAdapter } from './infrastructure/adapters/out/baml-analysis.adapter';
import { PlanUploadService } from './application/usecase/plan-upload.service';
import { PlanAnalysisService } from './application/usecase/plan-analysis.service';
import { AnalysisResultService } from './application/usecase/analysis-result.service';
import { ProjectRoomsService } from './application/usecase/project-rooms.service';
import { ProjectEquipmentService } from './application/usecase/project-equipment.service';
import { PlanFileEntity } from './infrastructure/persistence/plan-file.entity';
import { AnalysisResultEntity } from './infrastructure/persistence/analysis-result.entity';
import { ProjectRoomsEntity } from './infrastructure/persistence/project-rooms.entity';
import { ProjectEquipment } from './domain/project-equipment.entity';
import { Project } from '../../project/domain/entity/project.entity';
import { AnalysisResultRepository } from './infrastructure/persistence/analysis-result.repository';
import { ProjectRoomsRepository } from './infrastructure/persistence/project-rooms.repository';
import { ProjectEquipmentRepository } from './infrastructure/project-equipment.repository';
import { AnalysisResultDtoMapper } from './application/mapper/analysis-result.mapper';
import { ProjectRoomsDtoMapper } from './application/mapper/project-rooms.mapper';
import { ProjectRepository } from '../../project/infrastructure/persistence/project.repository';
import { PROJECT_REPOSITORY_TOKEN } from '../../project/domain/repository/project-repository.interface';

@Module({
  imports: [
    ConfigModule,
    MikroOrmModule.forFeature([PlanFileEntity, AnalysisResultEntity, ProjectRoomsEntity, ProjectEquipment, Project]),
  ],
  controllers: [PlanUploadController, ProjectPlansController, AnalysisResultController, ProjectRoomsController, ProjectEquipmentController],
  providers: [
    {
      provide: 'FileStoragePort',
      useClass: SupabaseStorageAdapter,
    },
    {
      provide: 'PlanRepositoryPort',
      useClass: SupabasePlanRepositoryAdapter,
    },
    {
      provide: 'AiAnalysisPort',
      useClass: BamlAnalysisAdapter,
    },
    {
      provide: 'AnalysisResultRepositoryPort',
      useClass: AnalysisResultRepository,
    },
    {
      provide: 'ProjectRoomsRepositoryPort',
      useClass: ProjectRoomsRepository,
    },
    {
      provide: 'ProjectEquipmentRepositoryPort',
      useClass: ProjectEquipmentRepository,
    },
    {
      provide: PROJECT_REPOSITORY_TOKEN,
      useClass: ProjectRepository,
    },
    PlanUploadService,
    PlanAnalysisService,
    AnalysisResultService,
    ProjectRoomsService,
    ProjectEquipmentService,
    AnalysisResultDtoMapper,
    ProjectRoomsDtoMapper,
  ],
  exports: [
    PlanUploadService, 
    PlanAnalysisService,
    AnalysisResultService,
    {
      provide: 'PlanRepositoryPort',
      useClass: SupabasePlanRepositoryAdapter,
    },
  ],
})
export class PlansModule {} 