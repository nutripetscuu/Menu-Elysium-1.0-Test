import { NextRequest, NextResponse } from 'next/server';
import {
  stripe,
  TRIAL_PERIOD_DAYS,
  getPlanPrice,
  getProductId,
  getPlanName,
  CURRENCY,
  PlanType,
  BillingCycle
} from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(request: NextRequest) {
  console.log('[STRIPE API] create-checkout-session endpoint called');

  try {
    console.log('[STRIPE API] Parsing request body...');
    const body = await request.json();
    console.log('[STRIPE API] Request body:', JSON.stringify(body, null, 2));

    const {
      email,
      plan,
      billingCycle,
      restaurantId,
    }: {
      email: string;
      plan: PlanType;
      billingCycle: BillingCycle;
      restaurantId: string;
    } = body;

    console.log('[STRIPE API] Parsed data:', { email, plan, billingCycle, restaurantId });

    // Validate required fields
    if (!email || !plan || !billingCycle || !restaurantId) {
      console.error('[STRIPE API] Missing required fields:', { email: !!email, plan: !!plan, billingCycle: !!billingCycle, restaurantId: !!restaurantId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan
    if (!['basic', 'professional', 'enterprise'].includes(plan)) {
      console.error('[STRIPE API] Invalid plan selected:', plan);
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Block self-serve for enterprise plan
    if (plan === 'enterprise') {
      console.error('[STRIPE API] Enterprise plan requires manual setup');
      return NextResponse.json(
        { error: 'The Enterprise plan requires a custom setup. Please contact sales.' },
        { status: 400 }
      );
    }

    console.log('[STRIPE API] Checking for existing Stripe customer...');
    // Get or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    console.log('[STRIPE API] Existing customers found:', existingCustomers.data.length);

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('[STRIPE API] Using existing customer:', customer.id);
      // CRITICAL: Update customer metadata to ensure restaurant_id is current
      console.log('[STRIPE API] Updating customer metadata with new restaurant_id...');
      customer = await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          restaurant_id: restaurantId,
        },
      });
      console.log('[STRIPE API] Customer metadata updated.');
    } else {
      console.log('[STRIPE API] Creating new customer...');
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          restaurant_id: restaurantId,
        },
      });
      console.log('[STRIPE API] Created new customer:', customer.id);
    }

    // Get product ID and price
    const productId = getProductId(plan, billingCycle);
    const planName = getPlanName(plan);
    const priceAmount = getPlanPrice(plan, billingCycle);

    console.log('[STRIPE API] Product ID:', productId);
    console.log('[STRIPE API] Plan name:', planName);
    console.log('[STRIPE API] Price amount (MXN):', priceAmount);

    // Validate product ID exists
    if (!productId) {
      console.error('[STRIPE API] No product ID found for plan:', plan, billingCycle);
      return NextResponse.json(
        { error: 'Invalid plan configuration. Please contact support.' },
        { status: 400 }
      );
    }

    console.log('[STRIPE API] Creating checkout session...');
    // Create checkout session using existing Stripe products
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product: productId, // Use the existing Stripe product ID
            recurring: {
              interval: billingCycle === 'monthly' ? 'month' : 'year',
            },
            unit_amount: priceAmount * 100, // Convert to centavos (cents in MXN)
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/onboarding/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/onboarding/plan?canceled=true`,
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: {
          restaurant_id: restaurantId,
          plan: plan,
          billing_cycle: billingCycle,
        },
      },
      metadata: {
        restaurant_id: restaurantId,
        plan: plan,
        billing_cycle: billingCycle,
      },
    });
    console.log('[STRIPE API] Checkout session created:', session.id);
    console.log('[STRIPE API] Checkout URL:', session.url);

    // Store initial subscription data
    console.log('[STRIPE API] Storing subscription data in Supabase...');
    const supabase = createAdminClient();

    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_PERIOD_DAYS);

    const { data: subData, error: subError } = await supabase.from('subscriptions').upsert({
      restaurant_id: restaurantId,
      stripe_customer_id: customer.id,
      plan: plan,
      status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString(),
    });

    if (subError) {
      console.error('[STRIPE API] Error storing subscription:', subError);
    } else {
      console.log('[STRIPE API] Subscription stored successfully');
    }

    console.log('[STRIPE API] Returning success response');
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('[STRIPE API] ❌ Error creating checkout session:', error);
    console.error('[STRIPE API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
