import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  plan: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsDateString()
  currentPeriodStart?: Date;

  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: Date;
} 