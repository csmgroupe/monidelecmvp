import { Migration } from '@mikro-orm/migrations';

export class Migration20250607134210 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "app"."projects" add column "status" varchar(255) not null default 'draft';`);
  }

}
