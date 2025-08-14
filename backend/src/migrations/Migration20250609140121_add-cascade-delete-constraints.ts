import { Migration } from '@mikro-orm/migrations';

export class Migration20250609140121_add_cascade_delete_constraints extends Migration {

  override async up(): Promise<void> {
    // Drop existing foreign key constraints
    this.addSql(`alter table "app"."analysis_results" drop constraint if exists "analysis_results_project_id_foreign";`);
    this.addSql(`alter table "app"."project_rooms" drop constraint if exists "project_rooms_project_id_foreign";`);
    this.addSql(`alter table "app"."project_equipment" drop constraint if exists "project_equipment_project_id_foreign";`);
    this.addSql(`alter table "app"."plan_files" drop constraint if exists "plan_files_project_id_foreign";`);

    // Recreate foreign key constraints with CASCADE delete
    this.addSql(`alter table "app"."analysis_results" add constraint "analysis_results_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "app"."project_rooms" add constraint "project_rooms_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "app"."project_equipment" add constraint "project_equipment_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "app"."plan_files" add constraint "plan_files_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    // Drop CASCADE constraints
    this.addSql(`alter table "app"."analysis_results" drop constraint if exists "analysis_results_project_id_foreign";`);
    this.addSql(`alter table "app"."project_rooms" drop constraint if exists "project_rooms_project_id_foreign";`);
    this.addSql(`alter table "app"."project_equipment" drop constraint if exists "project_equipment_project_id_foreign";`);
    this.addSql(`alter table "app"."plan_files" drop constraint if exists "plan_files_project_id_foreign";`);

    // Recreate original foreign key constraints without CASCADE
    this.addSql(`alter table "app"."analysis_results" add constraint "analysis_results_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);
    this.addSql(`alter table "app"."project_rooms" add constraint "project_rooms_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);
    this.addSql(`alter table "app"."project_equipment" add constraint "project_equipment_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);
    this.addSql(`alter table "app"."plan_files" add constraint "plan_files_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);
  }

}
