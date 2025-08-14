import { AnalysisResult } from '../../domain/analysis-result.entity';
import { AnalysisResultDto } from '../dto/analysis-result.dto';

export class AnalysisResultDtoMapper {
  static toDto(domain: AnalysisResult): AnalysisResultDto {
    return {
      id: domain.id,
      projectId: domain.project.getEntity().id,
      rawAnalysis: domain.rawAnalysis,
      createdAt: domain.createdAt,
    };
  }

  static toDtoArray(domains: AnalysisResult[]): AnalysisResultDto[] {
    return domains.map(domain => this.toDto(domain));
  }
} 