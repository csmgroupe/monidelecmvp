export class SubscriptionDto {
  id: string;
  userId: string;
  plan: string;
  status: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
} 