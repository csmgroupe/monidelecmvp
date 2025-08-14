import { Migration } from '@mikro-orm/migrations';

export class Migration20250609133928_add_project_equipment_table extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "app"."project_equipment" ("id" uuid not null, "name" varchar(255) not null, "quantity" int not null, "room_id" varchar(255) null, "category" varchar(255) not null, "type" varchar(255) null, "metadata" jsonb null, "project_id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "project_equipment_pkey" primary key ("id"));`);

    this.addSql(`alter table "app"."project_equipment" add constraint "project_equipment_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "app"."project_equipment";`);
  }

}
