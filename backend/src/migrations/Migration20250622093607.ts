import { Migration } from '@mikro-orm/migrations';

export class Migration20250622093607 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "app"."project_rooms" drop constraint if exists "project_rooms_project_id_foreign";`);

    this.addSql(`alter table "app"."project_equipment" drop constraint if exists "project_equipment_project_id_foreign";`);

    this.addSql(`alter table "app"."analysis_results" drop constraint if exists "analysis_results_project_id_foreign";`);

    this.addSql(`alter table "app"."project_rooms" add constraint "project_rooms_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "app"."project_equipment" add constraint "project_equipment_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "app"."analysis_results" add constraint "analysis_results_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "app"."project_rooms" drop constraint if exists "project_rooms_project_id_foreign";`);

    this.addSql(`alter table "app"."project_equipment" drop constraint if exists "project_equipment_project_id_foreign";`);

    this.addSql(`alter table "app"."analysis_results" drop constraint if exists "analysis_results_project_id_foreign";`);

    this.addSql(`alter table "app"."project_rooms" add constraint "project_rooms_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);

    this.addSql(`alter table "app"."project_equipment" add constraint "project_equipment_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);

    this.addSql(`alter table "app"."analysis_results" add constraint "analysis_results_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);
  }

}
