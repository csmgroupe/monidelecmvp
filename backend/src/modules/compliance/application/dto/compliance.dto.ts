import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoomEquipmentDto {
  @ApiProperty({ description: 'Equipment type' })
  @IsString()
  equipment_type: string;

  @ApiProperty({ description: 'Quantity of equipment' })
  quantity: number;

  @ApiProperty({ description: 'Equipment specifications' })
  @IsObject()
  specifications: Record<string, any>;
}

export class RoomDto {
  @ApiProperty({ description: 'Room identifier' })
  @IsString()
  room_id: string;

  @ApiProperty({ description: 'Room type' })
  @IsString()
  room_type: string;

  @ApiProperty({ description: 'Room area in square meters' })
  room_area: number;

  @ApiProperty({ description: 'List of equipment in the room', type: [RoomEquipmentDto] })
  @ValidateNested({ each: true })
  @Type(() => RoomEquipmentDto)
  equipment: RoomEquipmentDto[];
}

export class RoomEquipmentValidationRequestDto {
  @ApiProperty({ description: 'Installation identifier' })
  @IsString()
  installation_id: string;

  @ApiProperty({ description: 'JSON-LD context' })
  @IsObject()
  '@context': Record<string, any>;

  @ApiProperty({ description: 'List of rooms', type: [RoomDto] })
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  rooms: RoomDto[];
}

export class ComplianceViolationDto {
  @ApiProperty({ description: 'Violation message' })
  message: string;

  @ApiProperty({ description: 'Suggested fix' })
  suggested_fix: string;

  @ApiProperty({ description: 'Severity level' })
  severity: string;
}

export class GlobalComplianceDto {
  @ApiProperty({ description: 'Overall compliance status' })
  overall_status: string;

  @ApiProperty({ description: 'List of violations', type: [ComplianceViolationDto] })
  violations: ComplianceViolationDto[];
}

export class RoomResultDto {
  @ApiProperty({ description: 'Room identifier' })
  room_id: string;

  @ApiProperty({ description: 'Compliance status' })
  compliance_status: string;

  @ApiProperty({ description: 'Missing equipment' })
  missing_equipment: string[];

  @ApiProperty({ description: 'Violations', type: [ComplianceViolationDto] })
  violations: ComplianceViolationDto[];
}

export class RoomEquipmentValidationResponseDto {
  @ApiProperty({ description: 'Installation identifier' })
  installation_id: string;

  @ApiProperty({ description: 'Global compliance', type: GlobalComplianceDto })
  global_compliance: GlobalComplianceDto;

  @ApiProperty({ description: 'Room results', type: [RoomResultDto] })
  room_results: RoomResultDto[];

  @ApiProperty({ description: 'Validation timestamp' })
  timestamp: string;
}

export class CircuitBreakerDto {
  @ApiProperty({ description: 'Breaker rating in amperes' })
  rating: number;

  @ApiProperty({ description: 'Quantity needed' })
  quantity: number;

  @ApiProperty({ description: 'Description' })
  description: string;
}

export class ElectricalPanelDto {
  @ApiProperty({ description: 'Number of modules' })
  modules: number;

  @ApiProperty({ description: 'Panel type' })
  type: string;
}

export class CableDto {
  @ApiProperty({ description: 'Cable type' })
  type: string;

  @ApiProperty({ description: 'Cable section in mm²' })
  section: number;

  @ApiProperty({ description: 'Estimated length in meters' })
  length_estimate: number;
}

export class DimensioningDto {
  @ApiProperty({ description: 'Circuit breakers', type: [CircuitBreakerDto] })
  circuit_breakers: CircuitBreakerDto[];

  @ApiProperty({ description: 'Electrical panels', type: [ElectricalPanelDto] })
  electrical_panels: ElectricalPanelDto[];

  @ApiProperty({ description: 'Cables', type: [CableDto] })
  cables: CableDto[];

  @ApiProperty({ description: 'Installation notes' })
  installation_notes: string[];
}

export class GlobalValidationWithDimensioningResponseDto extends RoomEquipmentValidationResponseDto {
  @ApiProperty({ description: 'Electrical dimensioning', type: DimensioningDto })
  dimensioning: DimensioningDto;
} 