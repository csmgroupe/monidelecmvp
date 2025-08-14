import { Controller, Post, UseInterceptors, UploadedFile, Delete, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlanUploadService } from '../../../application/usecase/plan-upload.service';

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

@Controller('abplan/plans')
export class PlanUploadController {
  constructor(private readonly planUploadService: PlanUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlan(
    @UploadedFile() file: MulterFile,
    @Query('projectId') projectId?: string,
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

  @Delete(':path')
  async deletePlan(@Param('path') path: string) {
    await this.planUploadService.deletePlan(path);
    return { success: true };
  }
} 