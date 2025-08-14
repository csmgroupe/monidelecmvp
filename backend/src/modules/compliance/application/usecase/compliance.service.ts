import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  RoomEquipmentValidationRequestDto, 
  RoomEquipmentValidationResponseDto,
  GlobalValidationWithDimensioningResponseDto 
} from '../dto/compliance.dto';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private readonly complianceEngineUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.complianceEngineUrl = this.configService.get<string>('COMPLIANCE_ENGINE_URL') || 'http://compliance-engine:8000';
  }

  private async handleComplianceEngineError(response: Response, context: string): Promise<never> {
    let errorDetail = response.statusText;
    
    try {
      // Try to parse the response body for more detailed error information
      const responseText = await response.text();
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.detail) {
            errorDetail = errorData.detail;
          } else if (errorData.message) {
            errorDetail = errorData.message;
          } else if (typeof errorData === 'string') {
            errorDetail = errorData;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the raw text
          errorDetail = responseText;
        }
      }
    } catch (bodyReadError) {
      this.logger.warn(`Could not read error response body: ${bodyReadError.message}`);
    }

    this.logger.error(`${context} - Status: ${response.status}, Detail: ${errorDetail}`);
    
    throw new HttpException(
      {
        message: `Compliance engine validation failed`,
        detail: errorDetail,
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      },
      response.status,
    );
  }

  async validateRoomEquipment(
    request: RoomEquipmentValidationRequestDto,
  ): Promise<RoomEquipmentValidationResponseDto> {
    try {
      this.logger.log(`Validating room equipment for installation: ${request.installation_id}`);
      
      const response = await fetch(`${this.complianceEngineUrl}/validate/room-equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleComplianceEngineError(response, 'Room equipment validation failed');
      }

      const data: RoomEquipmentValidationResponseDto = await response.json();
      this.logger.log(`Room equipment validation completed for installation: ${request.installation_id}`);
      return data;
    } catch (error) {
      this.logger.error(`Room equipment validation failed for installation: ${request.installation_id}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          message: 'Failed to communicate with compliance engine',
          detail: error.message,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async validateGlobalWithDimensioning(
    request: RoomEquipmentValidationRequestDto,
  ): Promise<GlobalValidationWithDimensioningResponseDto> {
    try {
      this.logger.log(`Validating global with dimensioning for installation: ${request.installation_id}`);
      
      const response = await fetch(`${this.complianceEngineUrl}/validate/global-with-dimensioning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleComplianceEngineError(response, 'Global validation with dimensioning failed');
      }

      const data: GlobalValidationWithDimensioningResponseDto = await response.json();
      this.logger.log(`Global validation with dimensioning completed for installation: ${request.installation_id}`);
      return data;
    } catch (error) {
      this.logger.error(`Global validation with dimensioning failed for installation: ${request.installation_id}`, error.stack);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          message: 'Failed to communicate with compliance engine',
          detail: error.message,
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async healthCheck(): Promise<{ status: string; complianceEngine: string }> {
    try {
      const response = await fetch(`${this.complianceEngineUrl}/health`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        status: 'healthy',
        complianceEngine: data.status || 'unknown',
      };
    } catch (error) {
      this.logger.warn('Compliance engine health check failed', error.message);
      return {
        status: 'unhealthy',
        complianceEngine: 'unavailable',
      };
    }
  }
} 