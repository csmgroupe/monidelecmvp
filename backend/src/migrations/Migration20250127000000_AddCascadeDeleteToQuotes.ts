import { Migration } from '@mikro-orm/migrations';

export class Migration20250127000000_AddCascadeDeleteToQuotes extends Migration {

  async up(): Promise<void> {
    // Drop existing foreign key constraint
    this.addSql('alter table "app"."quotes" drop constraint "quotes_project_id_foreign";');
    
    // Add new foreign key constraint with cascade delete
    this.addSql('alter table "app"."quotes" add constraint "quotes_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    // Drop cascade constraint
    this.addSql('alter table "app"."quotes" drop constraint "quotes_project_id_foreign";');
    
    // Restore original constraint without cascade
    this.addSql('alter table "app"."quotes" add constraint "quotes_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;');
  }

} 