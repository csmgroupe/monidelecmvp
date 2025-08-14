import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DatabaseHealthService } from './database-health.service';
import { MigrationService } from './migration.service';

@Module({
  imports: [MikroOrmModule],
  providers: [DatabaseHealthService, MigrationService],
  exports: [DatabaseHealthService, MigrationService],
})
export class DatabaseModule {} 