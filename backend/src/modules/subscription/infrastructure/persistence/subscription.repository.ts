import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Subscription } from '../../domain/entity/subscription.entity';
import { ISubscriptionRepository } from '../../domain/repository/subscription-repository.interface';

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  private readonly repository: EntityRepository<Subscription>;
  private readonly em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
    this.repository = em.getRepository(Subscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    return this.repository.findOne({ id }, { populate: ['user'] });
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.repository.findOne({ user: userId }, { populate: ['user'] });
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    return this.repository.findOne({ stripeCustomerId });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.repository.findOne({ stripeSubscriptionId });
  }

  async save(subscription: Subscription): Promise<Subscription> {
    await this.em.persistAndFlush(subscription);
    return subscription;
  }

  async update(subscription: Subscription): Promise<Subscription> {
    await this.em.flush();
    return subscription;
  }

  async delete(id: string): Promise<void> {
    const subscription = await this.findById(id);
    if (subscription) {
      await this.em.removeAndFlush(subscription);
    }
  }

  async findAll(): Promise<Subscription[]> {
    return this.repository.findAll({ populate: ['user'] });
  }
}
