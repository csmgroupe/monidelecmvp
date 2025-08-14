import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from '../user/user.module';
import { Subscription } from './domain/entity/subscription.entity';
import { SubscriptionService } from './application/usecase/subscription.service';
import { SubscriptionController } from './infrastructure/adapter/in/subscription.controller';
import { SubscriptionRepository } from './infrastructure/persistence/subscription.repository';
import { SubscriptionMapper } from './application/mapper/subscription.mapper';
import { SUBSCRIPTION_REPOSITORY_TOKEN } from './domain/repository/subscription-repository.interface';

@Module({
  imports: [
    MikroOrmModule.forFeature([Subscription]),
    UserModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionMapper,
    {
      provide: SUBSCRIPTION_REPOSITORY_TOKEN,
      useClass: SubscriptionRepository,
    },
    SubscriptionService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
