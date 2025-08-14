import { FloorPlanAnalysis } from '@/baml_client';
import { Room } from '../../domain/room.entity';

export interface AiAnalysisPort {
  analyzeMultiplePlans(imageUrls: string[]): Promise<FloorPlanAnalysis>;
} 