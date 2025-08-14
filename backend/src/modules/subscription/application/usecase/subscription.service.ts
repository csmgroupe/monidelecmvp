import { Injectable, Inject } from '@nestjs/common';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY_TOKEN } from '../../domain/repository/subscription-repository.interface';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../../user/domain/repository/user-repository.interface';
import { Subscription } from '../../domain/entity/subscription.entity';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionDto } from '../dto/subscription.dto';
import { SubscriptionMapper } from '../mapper/subscription.mapper';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY_TOKEN)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly subscriptionMapper: SubscriptionMapper,
  ) {}

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionDto> {
    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a subscription
    const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
    if (existingSubscription) {
      throw new Error('User already has a subscription');
    }

    // Create subscription
    const subscription = new Subscription(
      user,
      createSubscriptionDto.plan,
      createSubscriptionDto.status,
    );

    if (createSubscriptionDto.stripeSubscriptionId) {
      subscription.stripeSubscriptionId = createSubscriptionDto.stripeSubscriptionId;
    }
    if (createSubscriptionDto.stripeCustomerId) {
      subscription.stripeCustomerId = createSubscriptionDto.stripeCustomerId;
    }
    if (createSubscriptionDto.currentPeriodStart) {
      subscription.currentPeriodStart = createSubscriptionDto.currentPeriodStart;
    }
    if (createSubscriptionDto.currentPeriodEnd) {
      subscription.currentPeriodEnd = createSubscriptionDto.currentPeriodEnd;
    }

    // Save subscription
    const savedSubscription = await this.subscriptionRepository.save(subscription);

    return this.subscriptionMapper.toDto(savedSubscription);
  }

  async findById(id: string): Promise<SubscriptionDto | null> {
    const subscription = await this.subscriptionRepository.findById(id);
    return subscription ? this.subscriptionMapper.toDto(subscription) : null;
  }

  async findByUserId(userId: string): Promise<SubscriptionDto | null> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    return subscription ? this.subscriptionMapper.toDto(subscription) : null;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Update properties
    if (updateSubscriptionDto.plan !== undefined) subscription.plan = updateSubscriptionDto.plan;
    if (updateSubscriptionDto.status !== undefined) subscription.status = updateSubscriptionDto.status;
    if (updateSubscriptionDto.stripeSubscriptionId !== undefined) subscription.stripeSubscriptionId = updateSubscriptionDto.stripeSubscriptionId;
    if (updateSubscriptionDto.stripeCustomerId !== undefined) subscription.stripeCustomerId = updateSubscriptionDto.stripeCustomerId;
    if (updateSubscriptionDto.currentPeriodStart !== undefined) subscription.currentPeriodStart = updateSubscriptionDto.currentPeriodStart;
    if (updateSubscriptionDto.currentPeriodEnd !== undefined) subscription.currentPeriodEnd = updateSubscriptionDto.currentPeriodEnd;

    const updatedSubscription = await this.subscriptionRepository.update(subscription);
    return this.subscriptionMapper.toDto(updatedSubscription);
  }

  async delete(id: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await this.subscriptionRepository.delete(id);
  }

  async cancelSubscription(userId: string): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'cancelled';
    const updatedSubscription = await this.subscriptionRepository.update(subscription);
    return this.subscriptionMapper.toDto(updatedSubscription);
  }

  async reactivateSubscription(userId: string): Promise<SubscriptionDto> {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'active';
    const updatedSubscription = await this.subscriptionRepository.update(subscription);
    return this.subscriptionMapper.toDto(updatedSubscription);
  }
}
