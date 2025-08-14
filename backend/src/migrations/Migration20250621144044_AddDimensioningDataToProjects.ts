import { Migration } from '@mikro-orm/migrations';

export class Migration20250621144044_AddDimensioningDataToProjects extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "app"."projects" add column "dimensioning_data" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "app"."projects" drop column if exists "dimensioning_data";`);
  }

}
