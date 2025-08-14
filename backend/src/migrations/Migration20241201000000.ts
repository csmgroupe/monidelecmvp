import { Migration } from '@mikro-orm/migrations';

export class Migration20241201000000 extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE TABLE "app"."plan_files" ("id" varchar(255) NOT NULL, "original_name" varchar(255) NOT NULL, "file_path" varchar(255) NOT NULL, "content_type" varchar(255) NOT NULL, "size" int NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "project_id" varchar(255) NULL, CONSTRAINT "plan_files_pkey" PRIMARY KEY ("id"));');
    this.addSql('CREATE INDEX "plan_files_project_id_index" ON "app"."plan_files" ("project_id");');

    this.addSql('ALTER TABLE "app"."plan_files" ADD CONSTRAINT "plan_files_project_id_foreign" FOREIGN KEY ("project_id") REFERENCES "app"."projects" ("id") ON UPDATE CASCADE ON DELETE SET NULL;');
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "app"."plan_files" CASCADE;');
  }
} 