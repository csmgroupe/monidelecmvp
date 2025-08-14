export interface PlansGateway {
  upload(file: File, projectId?: string): Promise<any>;
  analyze(filePath: string): Promise<any>;
  delete(filePath: string): Promise<any>;
}
