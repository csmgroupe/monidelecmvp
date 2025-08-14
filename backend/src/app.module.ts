import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PlansModule } from './modules/abplan/plans/plans.module';
import { QuotesModule } from './modules/abplan/quotes/quotes.module';
import { DatabaseModule } from './modules/database/database.module';
import { ComplianceModule } from './modules/compliance/compliance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(),
    DatabaseModule,
    UserModule,
    AuthModule,
    ProjectModule,
    SubscriptionModule,
    PlansModule,
    QuotesModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
