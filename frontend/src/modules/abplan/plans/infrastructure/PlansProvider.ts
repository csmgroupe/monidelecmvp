import { PlansGateway } from "../application/plans.gateway";
import { UploadPlanUseCase } from "../application/use-cases/upload-plan.usecase";
import { AnalyzePlanUseCase } from "../application/use-cases/analyze-plan.usecase";
import { HttpFileStorageAdapter } from "./adapters/http-file-storage.adapter";
import { HttpPlanAnalysisAdapter } from "./adapters/http-plan-analysis.adapter";

export class PlansProvider implements PlansGateway {
  private uploadPlanUseCase: UploadPlanUseCase;
  private analyzePlanUseCase: AnalyzePlanUseCase;

  constructor() {
    const fileStorageAdapter = new HttpFileStorageAdapter();
    const planAnalysisAdapter = new HttpPlanAnalysisAdapter();
    
    this.uploadPlanUseCase = new UploadPlanUseCase(fileStorageAdapter);
    this.analyzePlanUseCase = new AnalyzePlanUseCase(planAnalysisAdapter);
  }

  async upload(file: File, projectId?: string): Promise<any> {
    console.log('[PlansProvider] Uploading file with projectId:', projectId);
    return this.uploadPlanUseCase.execute(file, projectId);
  }

  async delete(filePath: string): Promise<any> {
    const fileStorageAdapter = new HttpFileStorageAdapter();
    return fileStorageAdapter.deleteFile(filePath);
  }

  async analyze(filePath: string): Promise<any> {
    return this.analyzePlanUseCase.execute(filePath);
  }
}
