import Stripe from 'stripe';

// Log environment check (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[STRIPE CONFIG] Checking STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET ✓' : 'NOT SET ✗');
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('[STRIPE CONFIG] STRIPE_SECRET_KEY is not set in environment variables');
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

console.log('[STRIPE CONFIG] Stripe initialized successfully');

// Plan configurations with Stripe Product IDs
// Prices are in Mexican Pesos (MXN)
export const STRIPE_PLANS = {
  basic: {
    name: 'Basic',
    monthly: {
      productId: 'prod_TFQThOH2tRmlrZ', // NoWaiter Basic (Monthly) - TEST MODE
      price: 169, // MXN
    },
    annual: {
      productId: 'prod_TFQWlYcbTeoEjR', // NoWaiter Basic (Annual) - TEST MODE
      price: 1623, // MXN
    },
  },
  professional: {
    name: 'Plus',
    monthly: {
      productId: 'prod_TFQUVgB0DH4Xzs', // NoWaiter Plus (Monthly) - TEST MODE
      price: 229, // MXN
    },
    annual: {
      productId: 'prod_TFQXFyQiu4Re08', // NoWaiter Plus (Annual) - TEST MODE
      price: 2199, // MXN
    },
  },
  enterprise: {
    name: 'Enterprise',
    monthly: {
      productId: '', // Contact sales - no product ID
      price: 0, // Custom pricing
    },
    annual: {
      productId: '', // Contact sales - no product ID
      price: 0, // Custom pricing
    },
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;
export type BillingCycle = 'monthly' | 'annual';

// Trial period configuration
export const TRIAL_PERIOD_DAYS = 7;

// Currency configuration
export const CURRENCY = 'mxn'; // Mexican Peso
export const CURRENCY_SYMBOL = '$'; // Peso symbol

// Get price based on plan and billing cycle
export function getPlanPrice(plan: PlanType, billingCycle: BillingCycle): number {
  return STRIPE_PLANS[plan][billingCycle].price;
}

// Get product ID based on plan and billing cycle
export function getProductId(plan: PlanType, billingCycle: BillingCycle): string {
  return STRIPE_PLANS[plan][billingCycle].productId;
}

// Format price for display (Mexican Peso)
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

// Get plan display name
export function getPlanName(plan: PlanType): string {
  return STRIPE_PLANS[plan].name;
}
