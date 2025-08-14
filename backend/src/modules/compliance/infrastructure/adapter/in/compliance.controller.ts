import { Body, Controller, Post, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ComplianceService } from '../../../application/usecase/compliance.service';
import { 
  RoomEquipmentValidationRequestDto, 
  RoomEquipmentValidationResponseDto,
  GlobalValidationWithDimensioningResponseDto 
} from '../../../application/dto/compliance.dto';

@ApiTags('compliance')
@Controller('api/v1/compliance')
@ApiBearerAuth()
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(
    private readonly complianceService: ComplianceService,
  ) {}

  @Post('validate/room-equipment')
  @ApiOperation({ 
    summary: 'Validate room equipment compliance',
    description: 'Validates electrical installation room equipment against NF C 15-100 standards' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Room equipment validation completed successfully',
    type: RoomEquipmentValidationResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable - Compliance engine not available' })
  @ApiBody({ type: RoomEquipmentValidationRequestDto })
  async validateRoomEquipment(
    @Body() request: RoomEquipmentValidationRequestDto,
  ): Promise<RoomEquipmentValidationResponseDto> {
    this.logger.log(`Room equipment validation requested for installation: ${request.installation_id}`);
    
    const result = await this.complianceService.validateRoomEquipment(request);
    
    this.logger.log(`Room equipment validation completed for installation: ${request.installation_id}`);
    return result;
  }

  @Post('validate/global-with-dimensioning')
  @ApiOperation({ 
    summary: 'Validate global installation with electrical dimensioning',
    description: 'Validates complete electrical installation against NF C 15-100 standards and provides electrical dimensioning calculations' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Global validation with dimensioning completed successfully',
    type: GlobalValidationWithDimensioningResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable - Compliance engine not available' })
  @ApiBody({ type: RoomEquipmentValidationRequestDto })
  async validateGlobalWithDimensioning(
    @Body() request: RoomEquipmentValidationRequestDto,
  ): Promise<GlobalValidationWithDimensioningResponseDto> {
    this.logger.log(`Global validation with dimensioning requested for installation: ${request.installation_id}`);
    
    const result = await this.complianceService.validateGlobalWithDimensioning(request);
    
    this.logger.log(`Global validation with dimensioning completed for installation: ${request.installation_id}`);
    return result;
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Check compliance service health',
    description: 'Returns the health status of the compliance service and underlying compliance engine' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Health check completed',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        complianceEngine: { type: 'string', example: 'healthy' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async healthCheck(): Promise<{ status: string; complianceEngine: string }> {
    this.logger.log('Health check requested');
    return this.complianceService.healthCheck();
  }
} 