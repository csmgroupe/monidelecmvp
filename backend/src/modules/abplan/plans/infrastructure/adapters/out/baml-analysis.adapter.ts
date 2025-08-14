import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Image } from '@boundaryml/baml';
import { AiAnalysisPort } from '../../../application/ports/ai-analysis.port';
import { b, FloorPlanAnalysis } from '@/baml_client';

@Injectable()
export class BamlAnalysisAdapter implements AiAnalysisPort {
  constructor(private configService: ConfigService) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is required for plan analysis. Please set OPENAI_API_KEY environment variable.');
    }
  }

  async analyzeMultiplePlans(imageUrls: string[]): Promise<FloorPlanAnalysis> {
    try {
      console.log(`Analyzing ${imageUrls.length} plan(s) with BAML: ${imageUrls.join(', ')}`);

      const images = imageUrls.map(url => Image.fromUrl(url));

      const analysis = await b.AnalyzeMultipleFloorPlans(images);
      
      console.log('BAML analysis received:', JSON.stringify(analysis, null, 2));

      if (!analysis.rooms || !Array.isArray(analysis.rooms)) {
        throw new Error('BAML analysis did not return a valid rooms array');
      }

      if (analysis.rooms.length === 0) {
        throw new Error('No rooms detected in the plan');
      }

      console.log(`Successfully parsed ${analysis.rooms.length} rooms from BAML analysis`);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing plan with BAML:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to analyze plan with BAML');
    }
  }
} 