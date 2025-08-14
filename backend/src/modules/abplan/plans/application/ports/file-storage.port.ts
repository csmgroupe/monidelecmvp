export interface FileStoragePort {
  uploadFile(bucket: string, file: Buffer, filePath: string, contentType: string): Promise<string>;
  deleteFile(bucket: string, filePath: string): Promise<void>;
  getPublicUrl(bucket: string, filePath: string): string;
}
