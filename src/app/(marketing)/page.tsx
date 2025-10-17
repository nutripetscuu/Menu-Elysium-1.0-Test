import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  QrCode,
  BarChart3,
  Settings,
  Smartphone,
  Globe,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container max-w-screen-2xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-[#0B2C4D]/20 bg-[#F0F2F5] px-4 py-1.5 text-sm">
            <Zap className="mr-2 h-4 w-4 text-[#C41E3A]" />
            <span className="text-[#333333]/80 font-medium">
              Trusted by restaurants worldwide
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-[#0B2C4D]">
            Restaurant Management
            <br />
            <span className="text-[#C41E3A]">Made Simple</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl text-lg text-[#333333]/70 sm:text-xl">
            Transform your restaurant with QR code ordering, real-time
            analytics, and powerful management tools. Set up in minutes, not
            weeks.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white font-semibold shadow-lg shadow-[#C41E3A]/20"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/menu?restaurant=elysium">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-[#0B2C4D] text-[#0B2C4D] hover:bg-[#0B2C4D] hover:text-white"
              >
                View Demo
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#333333]/70">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#C41E3A]" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#C41E3A]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#C41E3A]" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-[#0B2C4D]/10 bg-[#F0F2F5] py-24">
        <div className="container max-w-screen-2xl px-6">
          <div className="mx-auto max-w-5xl">
            {/* Section Header */}
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#0B2C4D]">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-[#333333]/70">
                Powerful features designed for modern restaurants
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1: QR Ordering */}
              <Card className="border-[#0B2C4D]/10 bg-white">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C41E3A]/10">
                    <QrCode className="h-6 w-6 text-[#C41E3A]" />
                  </div>
                  <CardTitle>QR Code Ordering</CardTitle>
                  <CardDescription>
                    Customers scan, browse, and order directly from their
                    phones. No app download required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                      <span>Instant menu updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Contactless ordering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Mobile-optimized interface</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 2: Analytics */}
              <Card className="border-[#0B2C4D]/10 bg-white">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                    <BarChart3 className="h-6 w-6 text-[#0B2C4D]" />
                  </div>
                  <CardTitle>Real-Time Analytics</CardTitle>
                  <CardDescription>
                    Make data-driven decisions with comprehensive insights into
                    your restaurant performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                      <span>Sales tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Popular items reports</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Customer insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 3: Easy Management */}
              <Card className="border-[#0B2C4D]/10 bg-white">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                    <Settings className="h-6 w-6 text-[#0B2C4D]" />
                  </div>
                  <CardTitle>Easy Management</CardTitle>
                  <CardDescription>
                    Intuitive admin panel to manage menus, modifiers, and
                    promotions effortlessly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                      <span>Drag-and-drop menus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Bulk operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Image management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 4: Multi-Device */}
              <Card className="border-[#0B2C4D]/10 bg-white">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                    <Smartphone className="h-6 w-6 text-[#0B2C4D]" />
                  </div>
                  <CardTitle>Mobile-First Design</CardTitle>
                  <CardDescription>
                    Beautiful, responsive interface that works perfectly on all
                    devices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                      <span>Lightning-fast loading</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Touch-optimized UI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Works offline</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 5: Multi-Location */}
              <Card className="border-[#0B2C4D]/10 bg-white">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                    <Globe className="h-6 w-6 text-[#0B2C4D]" />
                  </div>
                  <CardTitle>Multi-Location Support</CardTitle>
                  <CardDescription>
                    Manage multiple restaurant locations from a single
                    dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                      <span>Centralized management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Location-specific menus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Aggregate reporting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature 6: Fast Setup */}
              <Card className="border-[#0B2C4D]/10 bg-white">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                    <Zap className="h-6 w-6 text-[#0B2C4D]" />
                  </div>
                  <CardTitle>Quick Setup</CardTitle>
                  <CardDescription>
                    Get your restaurant online in minutes with our streamlined
                    onboarding.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                      <span>5-minute setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Import existing menu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>Free onboarding support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#0B2C4D]/10 bg-gradient-to-br from-[#0B2C4D] to-[#1a4d7a] py-24">
        <div className="container max-w-screen-2xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Ready to Modernize Your Restaurant?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join hundreds of restaurants already using NoWaiter to streamline
              operations and delight customers.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white font-semibold shadow-lg shadow-[#C41E3A]/30"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#0B2C4D]"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
