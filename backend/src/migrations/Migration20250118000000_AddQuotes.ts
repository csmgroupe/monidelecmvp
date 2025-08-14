import { Migration } from '@mikro-orm/migrations';

export class Migration20250118000000_AddQuotes extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "app"."quotes" ("id" varchar(255) not null, "project_id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "quote_items" jsonb not null, "dimensioning_items" jsonb not null, "total_amount" numeric(10,2) not null, "status" varchar(255) not null default \'draft\', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "quotes_pkey" primary key ("id"));');

    this.addSql('alter table "app"."quotes" add constraint "quotes_project_id_foreign" foreign key ("project_id") references "app"."projects" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "app"."quotes" cascade;');
  }

} 