import { Injectable } from '@nestjs/common';
import { Subscription } from '../../domain/entity/subscription.entity';
import { SubscriptionDto } from '../dto/subscription.dto';

@Injectable()
export class SubscriptionMapper {
  toDto(subscription: Subscription): SubscriptionDto {
    const dto = new SubscriptionDto();
    dto.id = subscription.id;
    dto.userId = subscription.user.unwrap().id;
    dto.plan = subscription.plan;
    dto.status = subscription.status;
    dto.stripeSubscriptionId = subscription.stripeSubscriptionId;
    dto.stripeCustomerId = subscription.stripeCustomerId;
    dto.currentPeriodStart = subscription.currentPeriodStart;
    dto.currentPeriodEnd = subscription.currentPeriodEnd;
    dto.createdAt = subscription.createdAt;
    dto.updatedAt = subscription.updatedAt;
    return dto;
  }
} 