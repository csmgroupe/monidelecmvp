import { Migration } from '@mikro-orm/migrations';

export class Migration20250608000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "app"."projects" drop column "plan_file_path";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "app"."projects" add column "plan_file_path" varchar(255) null;`);
  }

} 