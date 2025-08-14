import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ComplianceController } from './infrastructure/adapter/in/compliance.controller';
import { ComplianceService } from './application/usecase/compliance.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {} 