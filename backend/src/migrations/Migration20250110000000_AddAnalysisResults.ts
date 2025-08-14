import { Migration } from '@mikro-orm/migrations';

export class Migration20250110000000_AddAnalysisResults extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "analysis_results" ("id" varchar(255) not null, "project_id" varchar(255) not null, "raw_analysis" jsonb not null, "created_at" timestamptz not null, constraint "analysis_results_pkey" primary key ("id"));');
    this.addSql('create index "analysis_results_project_id_index" on "analysis_results" ("project_id");');

    this.addSql('alter table "analysis_results" add constraint "analysis_results_project_id_foreign" foreign key ("project_id") references "projects" ("id") on update cascade;');
    
    // Add dimensioning_data field to projects table
    this.addSql('alter table "projects" add column "dimensioning_data" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "analysis_results" drop constraint "analysis_results_project_id_foreign";');

    this.addSql('drop table if exists "analysis_results" cascade;');
    
    // Remove dimensioning_data field from projects table
    this.addSql('alter table "projects" drop column if exists "dimensioning_data";');
  }

} 