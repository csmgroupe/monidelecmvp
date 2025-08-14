import { IsString, IsOptional, IsArray, IsNumber, Min, IsIn } from 'class-validator';

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  quoteItems?: any[];

  @IsOptional()
  @IsArray()
  dimensioningItems?: any[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsIn(['draft', 'completed', 'sent'])
  status?: 'draft' | 'completed' | 'sent';
} 