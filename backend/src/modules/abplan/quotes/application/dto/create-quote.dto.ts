import { IsString, IsOptional, IsArray, IsNumber, Min } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  quoteItems: any[];

  @IsArray()
  dimensioningItems: any[];

  @IsNumber()
  @Min(0)
  totalAmount: number;
} 