export interface FileStoragePort {
  uploadFile(file: File, projectId?: string): Promise<{ planFile: PlanFileDto; publicUrl: string }>;
  deleteFile(filePath: string): Promise<void>;
}

export interface PlanFileDto {
  id: string;
  originalName: string;
  filePath: string;
  contentType: string;
  size: number;
  uploadedAt: string;
} 