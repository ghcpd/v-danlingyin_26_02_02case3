export type BillingCycle = 'monthly' | 'yearly' | 'custom';

export type SubscriptionStatus = 'active' | 'inactive';

export type SubscriptionCategory = 
  | 'streaming' 
  | 'software' 
  | 'utilities' 
  | 'health' 
  | 'education' 
  | 'other';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  cost: number;
  billingCycle: BillingCycle;
  customMonths?: number; // Used when billingCycle is 'custom'
  startDate: string; // ISO date string
  endDate?: string; // Optional ISO date string
  status: SubscriptionStatus;
}

export interface ExpenseSummary {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  inactiveCount: number;
  categoryBreakdown: Record<SubscriptionCategory, number>;
}

export interface UpcomingRenewal {
  subscription: Subscription;
  renewalDate: Date;
  daysUntilRenewal: number;
}
