import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from '../../domain/repository/project-repository.interface';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../user/domain/repository/user-repository.interface';
import { PlanRepositoryPort } from '../../../abplan/plans/application/ports/plan-repository.port';
import { QuoteRepositoryPort } from '../../../abplan/quotes/domain/repository/quote-repository.port';
import { Project } from '../../domain/entity/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectDto } from '../dto/project.dto';
import { ProjectMapper } from '../mapper/project.mapper';
import { PlanUploadService } from '../../../abplan/plans/application/usecase/plan-upload.service';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly projectRepository: IProjectRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly projectMapper: ProjectMapper,
    private readonly planUploadService: PlanUploadService,
    @Inject('PlanRepositoryPort')
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto): Promise<ProjectDto> {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create project
    const project = new Project(
      createProjectDto.name,
      user,
      createProjectDto.description,
      createProjectDto.typeProjet,
      createProjectDto.typeTravaux,
      createProjectDto.codePostal,
    );

    // Set numberOfPeople if provided
    if (createProjectDto.number_of_people !== undefined) {
      project.numberOfPeople = createProjectDto.number_of_people;
    }

    // Save project
    const savedProject = await this.projectRepository.save(project);

    // Get plan files for the project (should be empty for new project)
    const planFiles = await this.planRepository.findByProjectId(savedProject.id);

    return this.projectMapper.toDto(savedProject, planFiles);
  }

  async findById(id: string): Promise<ProjectDto | null> {
    const project = await this.projectRepository.findById(id);
    if (!project) return null;

    console.log(`[ProjectService] Finding plan files for project: ${project.id}`);
    const planFiles = await this.planRepository.findByProjectId(project.id);
    console.log(`[ProjectService] Found ${planFiles.length} plan files:`, planFiles.map(pf => ({ id: pf.id, filePath: pf.filePath })));

    return this.projectMapper.toDto(project, planFiles);
  }

  async findByUserId(userId: string): Promise<ProjectDto[]> {
    const projects = await this.projectRepository.findByUserId(userId);
    
    const projectDtos: ProjectDto[] = [];
    for (const project of projects) {
      const planFiles = await this.planRepository.findByProjectId(project.id);
      projectDtos.push(this.projectMapper.toDto(project, planFiles));
    }
    
    return projectDtos;
  }

  async findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<{ projects: ProjectDto[], total: number, page: number, totalPages: number }> {
    const result = await this.projectRepository.findByUserIdWithPagination(userId, page, limit);
    
    const projectDtos: ProjectDto[] = [];
    for (const project of result.projects) {
      const planFiles = await this.planRepository.findByProjectId(project.id);
      projectDtos.push(this.projectMapper.toDto(project, planFiles));
    }
    
    const totalPages = Math.ceil(result.total / limit);
    
    return {
      projects: projectDtos,
      total: result.total,
      page,
      totalPages
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    // Update properties
    if (updateProjectDto.name !== undefined) project.name = updateProjectDto.name;
    if (updateProjectDto.description !== undefined) project.description = updateProjectDto.description;
    if (updateProjectDto.typeProjet !== undefined) project.typeProjet = updateProjectDto.typeProjet;
    if (updateProjectDto.typeTravaux !== undefined) project.typeTravaux = updateProjectDto.typeTravaux;
    if (updateProjectDto.codePostal !== undefined) project.codePostal = updateProjectDto.codePostal;
    if (updateProjectDto.number_of_people !== undefined) project.numberOfPeople = updateProjectDto.number_of_people;
    if (updateProjectDto.dimensioning_data !== undefined) project.dimensioningData = updateProjectDto.dimensioning_data;
    if (updateProjectDto.status !== undefined) project.status = updateProjectDto.status;

    const updatedProject = await this.projectRepository.update(project);
    
    // Get plan files for the project
    const planFiles = await this.planRepository.findByProjectId(updatedProject.id);
    
    return this.projectMapper.toDto(updatedProject, planFiles);
  }

  async delete(id: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    // Delete all plan files for this project
    const planFiles = await this.planRepository.findByProjectId(id);
    for (const planFile of planFiles) {
      await this.planUploadService.deletePlan(planFile.filePath);
      await this.planRepository.delete(planFile.id);
    }

    await this.projectRepository.delete(id);
  }

  async uploadPlan(projectId: string, file: Buffer, originalName: string, contentType: string): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Upload new plan file - this will be handled by the plan upload service and saved via plan repository
    const result = await this.planUploadService.uploadPlan(file, originalName, contentType, projectId);
    
    // Get updated plan files for the project
    const planFiles = await this.planRepository.findByProjectId(projectId);

    return this.projectMapper.toDto(project, planFiles);
  }

  async getPlanUrl(projectId: string): Promise<string | null> {
    const planFiles = await this.planRepository.findByProjectId(projectId);
    if (planFiles.length === 0) {
      return null;
    }

    // Return the URL of the first plan file
    return this.planUploadService.getPublicUrl(planFiles[0].filePath);
  }
}
