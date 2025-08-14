import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from '../user/user.module';
import { PlansModule } from '../abplan/plans/plans.module';
import { Project } from './domain/entity/project.entity';
import { ProjectService } from './application/usecase/project.service';
import { ProjectController } from './infrastructure/adapter/in/project.controller';
import { ProjectRepository } from './infrastructure/persistence/project.repository';
import { ProjectMapper } from './application/mapper/project.mapper';
import { PROJECT_REPOSITORY_TOKEN } from './domain/repository/project-repository.interface';

@Module({
  imports: [
    MikroOrmModule.forFeature([Project]),
    UserModule,
    PlansModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectMapper,
    {
      provide: PROJECT_REPOSITORY_TOKEN,
      useClass: ProjectRepository,
    },
    ProjectService,
  ],
  exports: [
    ProjectService,
    {
      provide: PROJECT_REPOSITORY_TOKEN,
      useClass: ProjectRepository,
    },
  ],
})
export class ProjectModule {}
