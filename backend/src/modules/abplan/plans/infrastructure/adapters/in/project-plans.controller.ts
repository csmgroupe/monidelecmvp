import { Controller, Post, Get, Delete, UseInterceptors, UploadedFile, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlanUploadService } from '../../../application/usecase/plan-upload.service';
import { PlanAnalysisService } from '../../../application/usecase/plan-analysis.service';
import { ProjectRoomsService } from '../../../application/usecase/project-rooms.service';
import { ProjectEquipmentService } from '../../../application/usecase/project-equipment.service';

// Define the Multer file interface
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

@Controller('projects/:projectId/plans')
export class ProjectPlansController {
  constructor(
    private readonly planUploadService: PlanUploadService,
    private readonly planAnalysisService: PlanAnalysisService,
    private readonly projectRoomsService: ProjectRoomsService,
    private readonly projectEquipmentService: ProjectEquipmentService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlan(
    @Param('projectId') projectId: string,
    @UploadedFile() file: MulterFile,
  ) {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;
    const contentType = file.mimetype;

    const result = await this.planUploadService.uploadPlan(
      fileBuffer,
      originalName,
      contentType,
      projectId,
    );

    return {
      planFile: {
        id: result.planFile.id,
        originalName: result.planFile.originalName,
        filePath: result.planFile.filePath,
        contentType: result.planFile.contentType,
        size: result.planFile.size,
        uploadedAt: result.planFile.uploadedAt,
        projectId: result.planFile.projectId,
      },
      publicUrl: result.publicUrl,
    };
  }

  @Get()
  async getPlans(@Param('projectId') projectId: string) {
    const plans = await this.planUploadService.getPlansByProjectId(projectId);
    
    return {
      plans: plans.map(plan => ({
        id: plan.id,
        originalName: plan.originalName,
        filePath: plan.filePath,
        contentType: plan.contentType,
        size: plan.size,
        uploadedAt: plan.uploadedAt,
        projectId: plan.projectId,
        publicUrl: this.planUploadService.getPublicUrl(plan.filePath),
      })),
    };
  }

  @Get(':planId')
  async getPlan(
    @Param('projectId') projectId: string,
    @Param('planId') planId: string,
  ) {
    const plan = await this.planUploadService.getPlanById(planId);
    
    if (!plan || plan.projectId !== projectId) {
      throw new Error('Plan not found or does not belong to project');
    }

    return {
      planFile: {
        id: plan.id,
        originalName: plan.originalName,
        filePath: plan.filePath,
        contentType: plan.contentType,
        size: plan.size,
        uploadedAt: plan.uploadedAt,
        projectId: plan.projectId,
      },
      publicUrl: this.planUploadService.getPublicUrl(plan.filePath),
    };
  }

  @Post('analyze-all')
  async analyzeAllPlans(
    @Param('projectId') projectId: string,
  ) {
    return await this.planAnalysisService.analyzeAllProjectPlans(projectId);
  }

  @Post('purge')
  @HttpCode(HttpStatus.OK)
  async purgeProjectData(
    @Param('projectId') projectId: string,
  ) {
    // Purge project rooms by setting empty rooms array
    try {
      const existingRooms = await this.projectRoomsService.getProjectRooms(projectId);
      if (existingRooms) {
        await this.projectRoomsService.updateRooms({
          projectId,
          rooms: [],
          surfaceLoiCarrez: 0
        });
      }
    } catch (error) {
      console.log('No rooms to purge for project:', projectId);
    }

    // Purge project equipments by setting empty equipments array
    try {
      await this.projectEquipmentService.updateProjectEquipments({
        projectId,
        equipments: []
      });
    } catch (error) {
      console.log('No equipments to purge for project:', projectId);
    }

    return { success: true, message: 'Project data purged successfully' };
  }

  @Delete(':planId')
  async deletePlan(
    @Param('projectId') projectId: string,
    @Param('planId') planId: string,
  ) {
    const plan = await this.planUploadService.getPlanById(planId);
    
    if (!plan || plan.projectId !== projectId) {
      throw new Error('Plan not found or does not belong to project');
    }

    await this.planUploadService.deletePlan(plan.filePath);
    return { success: true };
  }
} 