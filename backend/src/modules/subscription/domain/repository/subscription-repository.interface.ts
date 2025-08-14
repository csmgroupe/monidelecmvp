import { Subscription } from '../entity/subscription.entity';

export const SUBSCRIPTION_REPOSITORY_TOKEN = Symbol('ISubscriptionRepository');

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<Subscription>;
  update(subscription: Subscription): Promise<Subscription>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Subscription[]>;
}
