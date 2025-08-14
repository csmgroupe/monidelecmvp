import { Controller, Get, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalysisResultService } from '../../../application/usecase/analysis-result.service';
import { AnalysisResultDto } from '../../../application/dto/analysis-result.dto';
import { AnalysisResultDtoMapper } from '../../../application/mapper/analysis-result.mapper';

@Controller('projects/:projectId/analysis-results')
export class AnalysisResultController {
  constructor(
    private readonly analysisResultService: AnalysisResultService,
  ) {}

  @Get('latest')
  async getLatestAnalysisResult(
    @Param('projectId') projectId: string,
  ): Promise<AnalysisResultDto | null> {
    const result = await this.analysisResultService.getLatestAnalysisResult(projectId);
    return result ? AnalysisResultDtoMapper.toDto(result) : null;
  }

  @Get('history')
  async getAnalysisHistory(
    @Param('projectId') projectId: string,
  ): Promise<AnalysisResultDto[]> {
    const results = await this.analysisResultService.getAnalysisHistory(projectId);
    return AnalysisResultDtoMapper.toDtoArray(results);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnalysisResult(
    @Param('id') id: string,
  ): Promise<void> {
    await this.analysisResultService.deleteAnalysisResult(id);
  }
} 