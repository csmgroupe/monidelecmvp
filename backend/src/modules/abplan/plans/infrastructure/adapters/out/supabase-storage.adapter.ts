import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { FileStoragePort } from '../../../application/ports/file-storage.port';

@Injectable()
export class SupabaseStorageAdapter implements FileStoragePort {
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase environment variables not found. File storage will not be available.');
    }
  }

  async uploadFile(bucket: string, file: Buffer, filePath: string, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return data.path;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  }

  getPublicUrl(bucket: string, filePath: string): string {
    if (!this.supabase) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
} 