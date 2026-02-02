import { Subscription, ExpenseSummary, UpcomingRenewal } from '../types/subscription';

/**
 * Calculates the monthly cost for a subscription based on its billing cycle
 */
export const calculateMonthlyCost = (subscription: Subscription): number => {
  switch (subscription.billingCycle) {
    case 'monthly':
      return subscription.cost;
    case 'yearly':
      return subscription.cost / 12;
    case 'custom':
      if (!subscription.customMonths || subscription.customMonths === 0) {
        return 0;
      }
      return subscription.cost / subscription.customMonths;
    default:
      return 0;
  }
};

/**
 * Calculates the yearly cost for a subscription based on its billing cycle
 */
export const calculateYearlyCost = (subscription: Subscription): number => {
  return calculateMonthlyCost(subscription) * 12;
};

/**
 * Calculates expense summary from a list of subscriptions
 */
export const calculateExpenseSummary = (subscriptions: Subscription[]): ExpenseSummary => {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  
  const totalMonthly = activeSubscriptions.reduce(
    (sum, sub) => sum + calculateMonthlyCost(sub),
    0
  );
  
  const totalYearly = activeSubscriptions.reduce(
    (sum, sub) => sum + calculateYearlyCost(sub),
    0
  );
  
  const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
    const monthlyCost = calculateMonthlyCost(sub);
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalMonthly,
    totalYearly,
    activeCount: activeSubscriptions.length,
    inactiveCount: subscriptions.filter(s => s.status === 'inactive').length,
    categoryBreakdown: categoryBreakdown as any,
  };
};

/**
 * Calculates the next renewal date for a subscription
 */
export const getNextRenewalDate = (subscription: Subscription): Date | null => {
  if (subscription.status === 'inactive') {
    return null;
  }
  
  const startDate = new Date(subscription.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // If there's an end date and it's in the past, no renewal
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    if (endDate < today) {
      return null;
    }
  }
  
  let monthsToAdd: number;
  switch (subscription.billingCycle) {
    case 'monthly':
      monthsToAdd = 1;
      break;
    case 'yearly':
      monthsToAdd = 12;
      break;
    case 'custom':
      monthsToAdd = subscription.customMonths || 1;
      break;
    default:
      return null;
  }
  
  // Find the next renewal date
  let nextRenewal = new Date(startDate);
  while (nextRenewal <= today) {
    nextRenewal.setMonth(nextRenewal.getMonth() + monthsToAdd);
  }
  
  // Check if next renewal is before end date
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    if (nextRenewal > endDate) {
      return null;
    }
  }
  
  return nextRenewal;
};

/**
 * Gets upcoming renewals within the next 30 days
 */
export const getUpcomingRenewals = (subscriptions: Subscription[]): UpcomingRenewal[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return subscriptions
    .filter(sub => sub.status === 'active')
    .map(sub => {
      const renewalDate = getNextRenewalDate(sub);
      if (!renewalDate) return null;
      
      const daysUntilRenewal = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        subscription: sub,
        renewalDate,
        daysUntilRenewal,
      };
    })
    .filter((renewal): renewal is UpcomingRenewal => 
      renewal !== null && renewal.renewalDate <= thirtyDaysFromNow
    )
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
};

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
