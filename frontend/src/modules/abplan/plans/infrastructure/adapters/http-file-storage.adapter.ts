import { FileStoragePort, PlanFileDto } from '../../application/ports/file-storage.port';

export class HttpFileStorageAdapter implements FileStoragePort {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  async uploadFile(file: File, projectId?: string): Promise<{ planFile: PlanFileDto; publicUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    let url = `${this.baseUrl}/abplan/plans/upload`;
    if (projectId) {
      url = `${this.baseUrl}/projects/${projectId}/plans/upload`;
    }
    
    console.log('[HttpFileStorageAdapter] Uploading to URL:', url, 'with projectId:', projectId);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If response isn't JSON, keep the default error message
      }
      
      // Include status code in error for duplicate detection
      const error = new Error(`${response.status}: ${errorMessage}`);
      throw error;
    }

    return response.json();
  }

  async deleteFile(filePath: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/abplan/plans/${encodeURIComponent(filePath)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  }
} 