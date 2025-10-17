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
      <section className="container max-w-screen-2xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-[#0B2C4D]">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-[#333333]/70">
            Choose the perfect plan for your restaurant. All plans include a
            7-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-[#0B2C4D]/10 bg-background p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-colors",
                billingCycle === "monthly"
                  ? "bg-[#C41E3A] text-white"
                  : "text-[#333333]/70 hover:text-[#0B2C4D]"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-colors",
                billingCycle === "annual"
                  ? "bg-[#C41E3A] text-white"
                  : "text-[#333333]/70 hover:text-[#0B2C4D]"
              )}
            >
              Annual
              <span className="ml-2 rounded-full bg-[#C41E3A]/10 px-2 py-0.5 text-xs text-[#C41E3A]">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container max-w-screen-2xl px-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col border-[#0B2C4D]/10",
                plan.popular && "border-[#C41E3A] shadow-lg"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <div className="flex items-center gap-1 rounded-full bg-[#C41E3A] px-3 py-1 text-xs font-medium text-white">
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
                      <span className="text-[#333333]/70">
                        /{billingCycle === "monthly" ? "month" : "month"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "annual" && plan.annualPrice && (
                    <p className="mt-1 text-sm text-[#333333]/70">
                      ${Math.round(plan.annualPrice / 12).toLocaleString('es-MX')} MXN/mes facturado anualmente
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"} className="w-full">
                  <Button
                    className={cn(
                      "w-full",
                      plan.popular
                        ? "bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white"
                        : "border-[#0B2C4D] text-[#0B2C4D] hover:bg-[#0B2C4D] hover:text-white"
                    )}
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
      <section className="border-t border-[#0B2C4D]/10 bg-[#F0F2F5] py-24">
        <div className="container max-w-screen-2xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter text-[#0B2C4D]">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#0B2C4D]">
                  What happens after the free trial?
                </h3>
                <p className="text-[#333333]/70">
                  After your 7-day free trial ends, you'll be automatically
                  enrolled in your selected plan. You can cancel anytime during
                  the trial with no charges.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#0B2C4D]">
                  Can I change plans later?
                </h3>
                <p className="text-[#333333]/70">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  will be reflected in your next billing cycle.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#0B2C4D]">
                  What payment methods do you accept?
                </h3>
                <p className="text-[#333333]/70">
                  We accept all major credit cards (Visa, MasterCard, American
                  Express) and offer invoicing for annual Enterprise plans.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#0B2C4D]">
                  Is there a setup fee?
                </h3>
                <p className="text-[#333333]/70">
                  No setup fees! All plans include free onboarding support to
                  help you get started quickly.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#0B2C4D]">
                  Can I add more locations later?
                </h3>
                <p className="text-[#333333]/70">
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
      <section className="border-t border-[#0B2C4D]/10 bg-gradient-to-br from-[#0B2C4D] to-[#1a4d7a] py-24">
        <div className="container max-w-screen-2xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Start your 7-day free trial today. No credit card required.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" className="bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white font-semibold shadow-lg shadow-[#C41E3A]/30">
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
