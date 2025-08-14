import { Migration } from '@mikro-orm/migrations';

export class Migration20240612_AddNumberOfPeopleToProjects extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "app"."projects" add column "number_of_people" int null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "app"."projects" drop column "number_of_people";');
  }
} 