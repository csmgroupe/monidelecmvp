import { Migration } from '@mikro-orm/migrations';

export class Migration20250609000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "app"."plan_files" add column "sha256_hash" varchar(64) not null default '';`);
    this.addSql(`create unique index "plan_files_sha256_project_unique" on "app"."plan_files" ("sha256_hash", "project_id") where "project_id" is not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "app"."plan_files_sha256_project_unique";`);
    this.addSql(`alter table "app"."plan_files" drop column "sha256_hash";`);
  }

} 