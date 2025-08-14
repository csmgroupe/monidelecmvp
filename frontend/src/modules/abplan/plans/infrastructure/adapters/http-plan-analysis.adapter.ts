import { PlanAnalysisPort, PlanAnalysisResult } from '../../application/ports/plan-analysis.port';

export class HttpPlanAnalysisAdapter implements PlanAnalysisPort {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  async analyzePlan(filePath: string): Promise<PlanAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/abplan/plans/analyze/${encodeURIComponent(filePath)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    return response.json();
  }
} 