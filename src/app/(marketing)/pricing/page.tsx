"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );

  const plans = [
    {
      name: "Basic",
      description: "Perfect for small restaurants getting started",
      monthlyPrice: 169, // MXN
      annualPrice: 1623, // MXN
      features: [
        "1 Restaurant Location",
        "QR Code Ordering",
        "Digital Menu Management",
        "Basic Analytics",
        "Up to 100 Menu Items",
        "Email Support",
        "Mobile Optimized",
        "Basic Customization",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Plus",
      description: "For growing restaurants with multiple needs",
      monthlyPrice: 229, // MXN
      annualPrice: 2199, // MXN
      features: [
        "Up to 3 Restaurant Locations",
        "Everything in Basic",
        "Advanced Analytics & Reports",
        "Unlimited Menu Items",
        "Custom Modifiers System",
        "Promotional Campaigns",
        "Priority Support",
        "Advanced Customization",
        "Multi-language Support",
        "Custom Domain",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For restaurant chains and franchises",
      monthlyPrice: null,
      annualPrice: null,
      features: [
        "Unlimited Locations",
        "Everything in Plus",
        "Dedicated Account Manager",
        "Custom Integrations",
        "White-label Solution",
        "Advanced Security (SSO)",
        "SLA Guarantee",
        "Custom Training",
        "API Access",
        "Multi-tenant Management",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === null) return "Custom";
    const price =
      billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
    return `$${price?.toLocaleString('es-MX')} MXN`;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container max-w-screen-2xl px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the perfect plan for your restaurant. All plans include a
            7-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-border/40 bg-background p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-colors",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-colors",
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container max-w-screen-2xl px-4 pb-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-primary shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice && (
                      <span className="text-muted-foreground">
                        /{billingCycle === "monthly" ? "month" : "month"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "annual" && plan.annualPrice && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${(plan.annualPrice / 12).toFixed(0).toLocaleString('es-MX')} MXN/mes facturado anualmente
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"} className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border/40 bg-muted/50 py-24">
        <div className="container max-w-screen-2xl px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  What happens after the free trial?
                </h3>
                <p className="text-muted-foreground">
                  After your 7-day free trial ends, you'll be automatically
                  enrolled in your selected plan. You can cancel anytime during
                  the trial with no charges.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Can I change plans later?
                </h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  will be reflected in your next billing cycle.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American
                  Express) and offer invoicing for annual Enterprise plans.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Is there a setup fee?
                </h3>
                <p className="text-muted-foreground">
                  No setup fees! All plans include free onboarding support to
                  help you get started quickly.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Can I add more locations later?
                </h3>
                <p className="text-muted-foreground">
                  Absolutely! You can upgrade to a higher tier or contact us for
                  custom pricing if you need more locations than your current
                  plan allows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 py-24">
        <div className="container max-w-screen-2xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start your 7-day free trial today. No credit card required.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
