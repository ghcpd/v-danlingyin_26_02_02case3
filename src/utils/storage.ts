import { Subscription } from '../types/subscription';

const STORAGE_KEY = 'subscription-tracker-data';

/**
 * Loads subscriptions from localStorage
 */
export const loadSubscriptions = (): Subscription[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return getInitialData();
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return getInitialData();
  }
};

/**
 * Saves subscriptions to localStorage
 */
export const saveSubscriptions = (subscriptions: Subscription[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
};

/**
 * Initial mock data
 */
const getInitialData = (): Subscription[] => {
  return [
    {
      id: '1',
      name: 'Netflix',
      category: 'streaming',
      cost: 15.99,
      billingCycle: 'monthly',
      startDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Spotify Premium',
      category: 'streaming',
      cost: 10.99,
      billingCycle: 'monthly',
      startDate: '2024-02-01',
      status: 'active',
    },
    {
      id: '3',
      name: 'Adobe Creative Cloud',
      category: 'software',
      cost: 54.99,
      billingCycle: 'monthly',
      startDate: '2023-06-10',
      status: 'active',
    },
    {
      id: '4',
      name: 'Microsoft 365',
      category: 'software',
      cost: 99.99,
      billingCycle: 'yearly',
      startDate: '2024-01-01',
      status: 'active',
    },
    {
      id: '5',
      name: 'Gym Membership',
      category: 'health',
      cost: 49.99,
      billingCycle: 'monthly',
      startDate: '2023-09-01',
      status: 'active',
    },
    {
      id: '6',
      name: 'Amazon Prime',
      category: 'other',
      cost: 139.00,
      billingCycle: 'yearly',
      startDate: '2023-03-15',
      status: 'active',
    },
    {
      id: '7',
      name: 'Hulu',
      category: 'streaming',
      cost: 12.99,
      billingCycle: 'monthly',
      startDate: '2023-05-20',
      endDate: '2024-12-20',
      status: 'inactive',
    },
    {
      id: '8',
      name: 'VPN Service',
      category: 'software',
      cost: 120.00,
      billingCycle: 'custom',
      customMonths: 24,
      startDate: '2024-01-01',
      status: 'active',
    },
  ];
};
