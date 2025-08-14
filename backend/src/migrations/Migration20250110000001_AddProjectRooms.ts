import { Migration } from '@mikro-orm/migrations';

export class Migration20250110000001_AddProjectRooms extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "app"."project_rooms" ("id" varchar(255) not null, "project_id" varchar(255) not null, "rooms" jsonb not null, "surface_loi_carrez" real not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "project_rooms_pkey" primary key ("id"));');

    this.addSql('alter table "app"."project_rooms" add constraint "project_rooms_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;');

    this.addSql('alter table "app"."project_rooms" add constraint "project_rooms_project_id_unique" unique ("project_id");');

    // Update analysis_results table to remove user-related columns
    this.addSql('alter table "app"."analysis_results" drop column "rooms";');
    this.addSql('alter table "app"."analysis_results" drop column "surface_loi_carrez";');
    this.addSql('alter table "app"."analysis_results" drop column "source";');
    this.addSql('alter table "app"."analysis_results" drop column "updated_at";');
  }

  async down(): Promise<void> {
    // Restore analysis_results columns
    this.addSql('alter table "app"."analysis_results" add column "rooms" jsonb not null;');
    this.addSql('alter table "app"."analysis_results" add column "surface_loi_carrez" real not null;');
    this.addSql('alter table "app"."analysis_results" add column "source" varchar(255) not null default \'auto\';');
    this.addSql('alter table "app"."analysis_results" add column "updated_at" timestamptz not null;');

    this.addSql('drop table if exists "app"."project_rooms" cascade;');
  }

} 