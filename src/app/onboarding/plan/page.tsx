'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coffee, AlertCircle, ArrowRight, ArrowLeft, Check, Tag } from 'lucide-react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { cn } from '@/lib/utils';

const plans = [
  {
    tier: 'basic' as const,
    name: 'Basic',
    description: 'Perfect for small cafes and food trucks',
    monthlyPrice: 169, // MXN
    annualPrice: 1623, // MXN
    features: [
      'Up to 50 menu items',
      'Basic QR code ordering',
      'Email support',
      'Mobile responsive menu',
      'Basic analytics',
    ],
    popular: false,
  },
  {
    tier: 'professional' as const,
    name: 'Plus',
    description: 'Best for growing restaurants',
    monthlyPrice: 229, // MXN
    annualPrice: 2199, // MXN
    features: [
      'Unlimited menu items',
      'Advanced QR ordering',
      'Priority support',
      'Custom branding',
      'Advanced analytics',
      'Multi-location support',
      'Promotion management',
    ],
    popular: true,
  },
  {
    tier: 'enterprise' as const,
    name: 'Enterprise',
    description: 'For restaurant chains and large operations',
    monthlyPrice: 0, // Custom pricing
    annualPrice: 0, // Custom pricing
    features: [
      'Everything in Plus',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'White-label options',
      'Advanced security',
      'SLA guarantee',
    ],
    popular: false,
  },
];

export default function PlanPage() {
  const router = useRouter();
  const { signupData, restaurantData, subdomainData, planData, setPlanData, currentStep, nextStep, previousStep } = useOnboarding();

  const [selectedTier, setSelectedTier] = useState<'basic' | 'professional' | 'enterprise'>(
    planData.tier === 'trial' ? 'professional' : planData.tier
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(planData.billingCycle);
  const [promoCode, setPromoCode] = useState(planData.promoCode);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPlan = plans.find((p) => p.tier === selectedTier)!;
  const price = billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  const savings = billingCycle === 'annual' && selectedPlan.monthlyPrice > 0
    ? selectedPlan.monthlyPrice * 12 - selectedPlan.annualPrice
    : 0;

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoApplied(false);

    if (!promoCode) {
      return;
    }

    // Simulate promo code validation
    const validPromos = ['LAUNCH50', 'WELCOME25', 'FIRSTMONTH'];
    if (validPromos.includes(promoCode.toUpperCase())) {
      setPromoApplied(true);
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle Enterprise plan separately - Contact Sales
      if (selectedTier === 'enterprise') {
        alert('The Enterprise plan requires a custom setup. Please contact our sales team at sales@nowaiter.com or call us at +52 123-456-7890.');
        setLoading(false);
        return;
      }

      // Log current context data for debugging
      console.log('[PLAN PAGE] Current context data:', {
        signupData,
        restaurantData,
        subdomainData,
      });

      // Validate that we have required data from previous steps
      if (!signupData.email) {
        alert('Please complete the signup step first.');
        setLoading(false);
        return;
      }

      if (!restaurantData.restaurantName) {
        alert('Please complete the restaurant information step first.');
        setLoading(false);
        return;
      }

      if (!subdomainData.subdomain) {
        alert('Please complete the subdomain selection step first.');
        setLoading(false);
        return;
      }

      // CRITICAL: Check if email is already registered BEFORE creating Stripe session
      console.log('[PLAN PAGE] Checking email availability before payment...');
      const emailCheckResponse = await fetch('/api/onboarding/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: signupData.email }),
      });

      if (!emailCheckResponse.ok) {
        throw new Error('Failed to verify email availability');
      }

      const emailCheckData = await emailCheckResponse.json();
      console.log('[PLAN PAGE] Email check result:', emailCheckData);

      if (!emailCheckData.available) {
        // Email is already registered with a completed restaurant
        alert(`This email is already registered. Please use the "Go to Login" button to access your account.`);
        setLoading(false);
        return;
      }

      if (emailCheckData.warning === 'incomplete') {
        // User started signup before but didn't complete it
        console.log('[PLAN PAGE] User has incomplete signup, allowing continuation');
      }

      // CRITICAL: Check if subdomain is still available BEFORE creating Stripe session
      console.log('[PLAN PAGE] Checking subdomain availability before payment...');
      const subdomainCheckResponse = await fetch('/api/onboarding/check-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain: subdomainData.subdomain }),
      });

      if (!subdomainCheckResponse.ok) {
        throw new Error('Failed to verify subdomain availability');
      }

      const subdomainCheckData = await subdomainCheckResponse.json();
      console.log('[PLAN PAGE] Subdomain check result:', subdomainCheckData);

      if (!subdomainCheckData.available) {
        // Subdomain was taken between selection and payment
        alert(`The subdomain "${subdomainData.subdomain}" was taken by another user. Please go back and choose a different subdomain.`);
        setLoading(false);
        return;
      }

      // Save to context
      setPlanData({
        tier: selectedTier,
        billingCycle,
        promoCode: promoApplied ? promoCode : '',
      });

      console.log('[PLAN PAGE] Email verified. Sending request to create checkout session...');
      const requestBody = {
        email: signupData.email,
        plan: selectedTier,
        billingCycle,
        restaurantId: subdomainData.subdomain,
      };
      console.log('[PLAN PAGE] Request body:', requestBody);

      // Create Stripe checkout session for payment
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setLoading(false);
      // Show error to user
      alert('There was an error processing your request. Please try again.');
    }
  };

  const handleBack = () => {
    previousStep();
    router.push('/onboarding/subdomain');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F0F2F5]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#C41E3A]" />
            <span className="text-xl font-bold text-[#0B2C4D]">NoWaiter</span>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <OnboardingProgress currentStep={currentStep} />

      {/* Form */}
      <div className="container max-w-5xl mx-auto px-4 pb-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Your Plan</CardTitle>
            <CardDescription>
              Start with a 7-day free trial. Cancel anytime, no questions asked.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Billing Cycle Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-lg border bg-muted/50 p-1">
                  <Button
                    type="button"
                    variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBillingCycle('monthly')}
                    disabled={loading}
                    className={billingCycle === 'monthly' ? 'bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white' : ''}
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={billingCycle === 'annual' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setBillingCycle('annual')}
                    disabled={loading}
                    className={billingCycle === 'annual' ? 'bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white' : ''}
                  >
                    Annual
                    <span className="ml-2 rounded bg-[#C41E3A]/10 px-1.5 py-0.5 text-xs text-[#C41E3A]">
                      Save up to 17%
                    </span>
                  </Button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.tier}
                    className={cn(
                      'relative rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg',
                      selectedTier === plan.tier
                        ? 'border-[#C41E3A] bg-[#C41E3A]/5'
                        : 'border-border hover:border-[#C41E3A]/50',
                      plan.popular && 'ring-2 ring-[#C41E3A]/20'
                    )}
                    onClick={() => setSelectedTier(plan.tier)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-[#C41E3A] px-3 py-1 text-xs font-medium text-white">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Plan Name */}
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">
                            {plan.monthlyPrice > 0 || plan.annualPrice > 0
                              ? `$${billingCycle === 'monthly' ? plan.monthlyPrice.toLocaleString('es-MX') : plan.annualPrice.toLocaleString('es-MX')} MXN`
                              : 'Custom'}
                          </span>
                          {(plan.monthlyPrice > 0 || plan.annualPrice > 0) && (
                            <span className="text-muted-foreground">
                              /{billingCycle === 'monthly' ? 'mes' : 'año'}
                            </span>
                          )}
                        </div>
                        {billingCycle === 'annual' && plan.annualPrice > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ${Math.round(plan.annualPrice / 12).toLocaleString('es-MX')} MXN/mes facturado anualmente
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-[#C41E3A] mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Selection indicator */}
                      {selectedTier === plan.tier && (
                        <div className="pt-2">
                          <div className="rounded-lg bg-[#C41E3A]/10 px-3 py-2 text-center text-sm font-medium text-[#C41E3A]">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="promoCode"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoApplied(false);
                        setPromoError('');
                      }}
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={loading || !promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600">Promo code applied successfully!</p>
                )}
                {promoError && (
                  <p className="text-sm text-destructive">{promoError}</p>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Facturación</span>
                  <span className="font-medium capitalize">{billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
                </div>
                {billingCycle === 'annual' && savings > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ahorro anual</span>
                    <span className="font-medium text-[#C41E3A]">${savings.toLocaleString('es-MX')} MXN</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-bold">
                      {price > 0 ? `$${price.toLocaleString('es-MX')} MXN` : 'Personalizado'}
                    </span>
                  </div>
                  {price > 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      Gratis por 7 días, luego ${price.toLocaleString('es-MX')} MXN/{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </p>
                  )}
                </div>
              </div>

              {/* Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your 7-day free trial starts today. We'll send you a reminder before charging your card.
                  You can cancel anytime from your dashboard.
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white">
                  {loading ? (
                    <>Processing...</>
                  ) : selectedTier === 'enterprise' ? (
                    <>
                      Contact Sales
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
