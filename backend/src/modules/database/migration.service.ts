import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Only run migrations automatically in development
    if (this.configService.get('NODE_ENV') === 'development') {
      await this.runPendingMigrations();
    }
  }

  async runPendingMigrations() {
    try {
      this.logger.log('Checking for pending migrations...');
      
      const migrator = this.orm.getMigrator();
      const pendingMigrations = await migrator.getPendingMigrations();
      
      if (pendingMigrations.length > 0) {
        this.logger.log(`Found ${pendingMigrations.length} pending migrations`);
        await migrator.up();
        this.logger.log('✅ Migrations completed successfully');
      } else {
        this.logger.log('✅ No pending migrations');
      }
    } catch (error) {
      this.logger.error('❌ Migration failed:', error.message);
      throw error;
    }
  }

  async createMigration(name?: string) {
    try {
      const migrator = this.orm.getMigrator();
      const migration = await migrator.createMigration(undefined, false, false, name);
      this.logger.log(`✅ Migration created: ${migration.fileName}`);
      return migration;
    } catch (error) {
      this.logger.error('❌ Failed to create migration:', error.message);
      throw error;
    }
  }

  async getMigrationStatus() {
    const migrator = this.orm.getMigrator();
    const executed = await migrator.getExecutedMigrations();
    const pending = await migrator.getPendingMigrations();
    
    return {
      executed: executed.map(m => m.name),
      pending: pending.map(m => m.name),
    };
  }
} 