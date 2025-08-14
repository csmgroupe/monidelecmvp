import { Migration } from '@mikro-orm/migrations';

export class Migration20250115000000_AddProjectFields extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "app"."projects" add column "type_projet" varchar(255) null;`);
    this.addSql(`alter table "app"."projects" add column "type_travaux" varchar(255) null;`);
    this.addSql(`alter table "app"."projects" add column "code_postal" varchar(255) null;`);
    
    this.addSql(`alter table "app"."projects" add constraint "projects_type_projet_check" check ("type_projet" in ('Résidentiel', 'Tertiaire'));`);
    this.addSql(`alter table "app"."projects" add constraint "projects_type_travaux_check" check ("type_travaux" in ('Construction', 'Renovation'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "app"."projects" drop constraint "projects_type_projet_check";`);
    this.addSql(`alter table "app"."projects" drop constraint "projects_type_travaux_check";`);
    
    this.addSql(`alter table "app"."projects" drop column "type_projet";`);
    this.addSql(`alter table "app"."projects" drop column "type_travaux";`);
    this.addSql(`alter table "app"."projects" drop column "code_postal";`);
  }

} 