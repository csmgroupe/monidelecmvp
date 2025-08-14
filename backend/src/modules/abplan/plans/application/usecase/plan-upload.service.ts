import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { PlanFile } from '../../domain/plan-file.entity';
import { FileStoragePort } from '../ports/file-storage.port';
import { PlanRepositoryPort } from '../ports/plan-repository.port';
import * as crypto from 'crypto';

@Injectable()
export class PlanUploadService {
  constructor(
    @Inject('FileStoragePort') private readonly fileStoragePort: FileStoragePort,
    @Inject('PlanRepositoryPort') private readonly planRepositoryPort: PlanRepositoryPort,
  ) {}

  async uploadPlan(file: Buffer, originalName: string, contentType: string, projectId?: string): Promise<{ planFile: PlanFile; publicUrl: string }> {
    // Calculate SHA256 hash of the file
    const sha256Hash = crypto.createHash('sha256').update(file).digest('hex');

    // Check for duplicate if projectId is provided
    if (projectId) {
      const existingPlan = await this.planRepositoryPort.findByHashAndProject(sha256Hash, projectId);
      if (existingPlan) {
        throw new ConflictException(`Un plan identique existe déjà dans ce projet: ${existingPlan.originalName}`);
      }
    }

    const planFile = PlanFile.create(originalName, contentType, file.length, sha256Hash, projectId);

    // Upload file to storage
    const uploadedPath = await this.fileStoragePort.uploadFile(
      'plans',
      file,
      planFile.filePath,
      contentType,
    );

    // Save plan file metadata to database
    const savedPlanFile = await this.planRepositoryPort.save(planFile);

    const publicUrl = this.fileStoragePort.getPublicUrl('plans', planFile.filePath);

    return {
      planFile: savedPlanFile,
      publicUrl,
    };
  }

  async deletePlan(filePath: string): Promise<void> {
    // Delete from storage
    await this.fileStoragePort.deleteFile('plans', filePath);
    // Delete from database
    await this.planRepositoryPort.deleteByFilePath(filePath);
  }

  getPublicUrl(filePath: string): string {
    return this.fileStoragePort.getPublicUrl('plans', filePath);
  }

  async getPlansByProjectId(projectId: string): Promise<PlanFile[]> {
    return this.planRepositoryPort.findByProjectId(projectId);
  }

  async getPlanById(planId: string): Promise<PlanFile | null> {
    return this.planRepositoryPort.findById(planId);
  }
}
