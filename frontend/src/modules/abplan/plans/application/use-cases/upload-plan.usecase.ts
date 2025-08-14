import { FileStoragePort, PlanFileDto } from '../ports/file-storage.port';

export class UploadPlanUseCase {
  constructor(private fileStoragePort: FileStoragePort) {}

  async execute(file: File, projectId?: string): Promise<{ planFile: PlanFileDto; publicUrl: string }> {
    console.log('[UploadPlanUseCase] Executing with projectId:', projectId);
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type (e.g., images, PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type');
    }

    // Check file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large');
    }

    // Upload file via the port
    return await this.fileStoragePort.uploadFile(file, projectId);
  }
} 