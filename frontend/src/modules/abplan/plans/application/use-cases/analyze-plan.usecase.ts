import { PlanAnalysisPort, PlanAnalysisResult } from '../ports/plan-analysis.port';

export class AnalyzePlanUseCase {
  constructor(private planAnalysisPort: PlanAnalysisPort) {}

  async execute(filePath: string): Promise<PlanAnalysisResult> {
    // Validate file path
    if (!filePath || filePath.trim().length === 0) {
      throw new Error('File path is required');
    }

    // Analyze plan via the port
    return await this.planAnalysisPort.analyzePlan(filePath);
  }
} 