import { Migration } from '@mikro-orm/migrations';

export class Migration20250524120000InitialSchema extends Migration {

  async up(): Promise<void> {
    // Create app schema if it doesn't exist
    this.addSql('create schema if not exists "app";');
    
    // Create users table in app schema
    this.addSql('create table "app"."users" ("id" varchar(255) not null, "company" varchar(255) not null, "siret" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "users_pkey" primary key ("id"));');
    this.addSql('alter table "app"."users" add constraint "users_email_unique" unique ("email");');

    // Create subscriptions table in app schema
    this.addSql('create table "app"."subscriptions" ("id" varchar(255) not null, "user_id" varchar(255) not null, "plan" varchar(255) not null, "status" varchar(255) not null, "stripe_subscription_id" varchar(255) null, "stripe_customer_id" varchar(255) null, "current_period_start" timestamptz null, "current_period_end" timestamptz null, "cancel_at" timestamptz null, "canceled_at" timestamptz null, "trial_start" timestamptz null, "trial_end" timestamptz null, "credits_remaining" int null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "subscriptions_pkey" primary key ("id"));');
    this.addSql('alter table "app"."subscriptions" add constraint "subscriptions_user_id_unique" unique ("user_id");');

    // Create projects table in app schema
    this.addSql('create table "app"."projects" ("id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "user_id" varchar(255) not null, "plan_file_path" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "projects_pkey" primary key ("id"));');

    // Create auth table in app schema
    this.addSql('create table "app"."auth" ("id" varchar(255) not null, "user_id" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "reset_token" varchar(255) null, "reset_token_expiry" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "auth_pkey" primary key ("id"));');
    this.addSql('alter table "app"."auth" add constraint "auth_user_id_unique" unique ("user_id");');
    this.addSql('alter table "app"."auth" add constraint "auth_email_unique" unique ("email");');

    // Add foreign key constraints
    this.addSql('alter table "app"."subscriptions" add constraint "subscriptions_user_id_foreign" foreign key ("user_id") references "app"."users" ("id") on update cascade;');
    this.addSql('alter table "app"."projects" add constraint "projects_user_id_foreign" foreign key ("user_id") references "app"."users" ("id") on update cascade;');
    this.addSql('alter table "app"."auth" add constraint "auth_user_id_foreign" foreign key ("user_id") references "app"."users" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    // Drop foreign key constraints first
    this.addSql('alter table "app"."auth" drop constraint "auth_user_id_foreign";');
    this.addSql('alter table "app"."projects" drop constraint "projects_user_id_foreign";');
    this.addSql('alter table "app"."subscriptions" drop constraint "subscriptions_user_id_foreign";');
    
    // Drop tables
    this.addSql('drop table if exists "app"."auth" cascade;');
    this.addSql('drop table if exists "app"."projects" cascade;');
    this.addSql('drop table if exists "app"."subscriptions" cascade;');
    this.addSql('drop table if exists "app"."users" cascade;');
    
    // Drop schema if empty
    this.addSql('drop schema if exists "app" cascade;');
  }
} 