export interface PlanAnalysisPort {
  analyzePlan(filePath: string): Promise<PlanAnalysisResult>;
}

export interface Room {
  id: string;
  name: string;
  surface: number;
  options: Record<string, any>;
}

export interface PlanAnalysisResult {
  rooms: Room[];
} 