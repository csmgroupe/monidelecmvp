import { Entity, PrimaryKey, Property, OneToOne, Reference, wrap } from '@mikro-orm/core';
import { uuidv7 } from 'uuidv7';
import { User } from '../../../user/domain/entity/user.entity';

@Entity({ tableName: 'subscriptions' })
export class Subscription {
  @PrimaryKey()
  id: string = uuidv7();

  @OneToOne(() => User)
  user: Reference<User>;

  @Property()
  plan: string; // 'free', 'premium', 'enterprise'

  @Property()
  status: string; // 'active', 'cancelled', 'expired'

  @Property({ nullable: true })
  stripeSubscriptionId?: string;

  @Property({ nullable: true })
  stripeCustomerId?: string;

  @Property({ nullable: true })
  currentPeriodStart?: Date;

  @Property({ nullable: true })
  currentPeriodEnd?: Date;

  @Property({ nullable: true })
  cancelAt?: Date;

  @Property({ nullable: true })
  canceledAt?: Date;

  @Property({ nullable: true })
  trialStart?: Date;

  @Property({ nullable: true })
  trialEnd?: Date;

  @Property({ nullable: true })
  creditsRemaining?: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    user: User,
    plan: string,
    status: string = 'active',
  ) {
    this.user = wrap(user).toReference();
    this.plan = plan;
    this.status = status;
  }
}
