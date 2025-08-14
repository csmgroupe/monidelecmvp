import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseHealthService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.checkDatabaseConnection();
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing database connection...');
      
      // Log connection details (without password)
      const dbHost = this.configService.get('DB_HOST');
      const dbPort = this.configService.get('DB_PORT');
      const dbName = this.configService.get('DB_NAME');
      const dbUser = this.configService.get('DB_USER');
      
      this.logger.log(`Connecting to: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);
      
      // Test the connection
      await this.em.getConnection().execute('SELECT 1 as test');
      
      this.logger.log('✅ Database connection successful');
      return true;
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      
      // Provide helpful debugging information
      if (error.code === 'ENOTFOUND') {
        this.logger.error('DNS resolution failed. Please check:');
        this.logger.error('1. Your internet connection');
        this.logger.error('2. The Supabase hostname in your .env file');
        this.logger.error('3. Whether your Supabase project is active');
      } else if (error.code === 'ECONNREFUSED') {
        this.logger.error('Connection refused. Please check:');
        this.logger.error('1. Database credentials');
        this.logger.error('2. Supabase project status');
        this.logger.error('3. Network firewall settings');
      }
      
      return false;
    }
  }
} 