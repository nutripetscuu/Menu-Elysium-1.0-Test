import Link from "next/link";
import Image from "next/image";
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
  Image as ImageIcon,
  Tag,
  Users,
  Clock,
  Shield,
  Palette,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container max-w-screen-2xl mx-auto px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-[#0B2C4D]">
            Powerful Features for
            <br />
            <span className="text-[#C41E3A]">Modern Restaurants</span>
          </h1>
          <p className="mt-4 text-lg text-[#333333]/70">
            Everything you need to run a successful restaurant, from QR
            ordering to analytics and beyond.
          </p>
        </div>
      </section>

      {/* QR Code Ordering */}
      <section className="border-t border-[#0B2C4D]/10 bg-[#F0F2F5] py-24">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                <QrCode className="h-6 w-6 text-[#C41E3A]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[#0B2C4D]">
                QR Code Ordering System
              </h2>
              <p className="mt-4 text-lg text-[#333333]/70">
                Let customers order directly from their phones with a simple
                QR code scan. No app downloads, no waiting for servers.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Contactless Experience:</strong> Safe and hygienic
                    ordering for your customers
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Instant Updates:</strong> Menu changes reflect
                    immediately on all QR codes
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Mobile Optimized:</strong> Beautiful interface
                    designed for smartphones
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Multiple Languages:</strong> Support for
                    international customers
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-[#0B2C4D]/10 bg-background p-8">
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <QrCode className="h-32 w-32 text-[#333333]/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard */}
      <section className="border-t border-[#0B2C4D]/10 py-24">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 rounded-lg border border-[#0B2C4D]/10 bg-background p-8">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-32 w-32 text-[#333333]/70" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                <BarChart3 className="h-6 w-6 text-[#C41E3A]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Real-Time Analytics
              </h2>
              <p className="mt-4 text-lg text-[#333333]/70">
                Make data-driven decisions with comprehensive insights into
                sales, popular items, and customer behavior.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Sales Tracking:</strong> Monitor revenue in
                    real-time across all locations
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Popular Items:</strong> Identify your best-selling
                    dishes instantly
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Customer Insights:</strong> Understand ordering
                    patterns and preferences
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Export Reports:</strong> Download data for
                    accounting and tax purposes
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Management */}
      <section className="border-t border-[#0B2C4D]/10 bg-[#F0F2F5] py-24">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                <Settings className="h-6 w-6 text-[#C41E3A]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Easy Menu Management
              </h2>
              <p className="mt-4 text-lg text-[#333333]/70">
                Manage your entire menu with an intuitive admin panel. Add,
                edit, or remove items in seconds.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Drag & Drop:</strong> Reorganize menu items with
                    simple drag-and-drop
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Bulk Operations:</strong> Update prices or
                    availability for multiple items at once
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Rich Media:</strong> Add high-quality images and
                    detailed descriptions
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C41E3A]" />
                  <div>
                    <strong>Categories:</strong> Organize items into logical
                    sections
                  </div>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-[#0B2C4D]/10 bg-background p-8">
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Settings className="h-32 w-32 text-[#333333]/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="border-t border-[#0B2C4D]/10 py-24">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              More Powerful Features
            </h2>
            <p className="mt-4 text-lg text-[#333333]/70">
              Everything you need to succeed in one platform
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Modifiers System */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                  <Tag className="h-6 w-6 text-[#C41E3A]" />
                </div>
                <CardTitle>Custom Modifiers</CardTitle>
                <CardDescription>
                  Create unlimited customization options for menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#333333]/70">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Multiple choice modifiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Price adjustments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Required vs optional</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Promotions */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                  <Zap className="h-6 w-6 text-[#C41E3A]" />
                </div>
                <CardTitle>Promotional Campaigns</CardTitle>
                <CardDescription>
                  Run time-limited promotions to boost sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#333333]/70">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Scheduled promotions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Banner images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Priority display</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-Location */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                  <Globe className="h-6 w-6 text-[#C41E3A]" />
                </div>
                <CardTitle>Multi-Location Support</CardTitle>
                <CardDescription>
                  Manage multiple restaurants from one dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#333333]/70">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Centralized control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Location-specific menus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Aggregate reporting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Mobile First */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                  <Smartphone className="h-6 w-6 text-[#C41E3A]" />
                </div>
                <CardTitle>Mobile-First Design</CardTitle>
                <CardDescription>
                  Beautiful on every device, from phone to desktop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#333333]/70">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Responsive design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Touch optimized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Lightning fast</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Image Management */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                  <ImageIcon className="h-6 w-6 text-[#C41E3A]" />
                </div>
                <CardTitle>Image Management</CardTitle>
                <CardDescription>
                  Professional image hosting and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#333333]/70">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>CDN delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Auto optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Unlimited storage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B2C4D]/10">
                  <Shield className="h-6 w-6 text-[#C41E3A]" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level security for your business data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-[#333333]/70">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Encrypted data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Secure authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C41E3A]" />
                    <span>Regular backups</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-[#0B2C4D]/10 bg-[#F0F2F5] py-24">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Why Restaurant Owners Love NoWaiter
            </h2>
            <p className="mt-4 text-lg text-[#333333]/70">
              Built by restaurant operators, for restaurant operators
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2C4D]/10">
                <Clock className="h-8 w-8 text-[#C41E3A]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Save Time</h3>
              <p className="text-[#333333]/70">
                Update your menu in seconds, not hours. No more printing costs.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2C4D]/10">
                <Users className="h-8 w-8 text-[#C41E3A]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Improve Service</h3>
              <p className="text-[#333333]/70">
                Let your staff focus on hospitality, not taking orders.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B2C4D]/10">
                <BarChart3 className="h-8 w-8 text-[#C41E3A]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Increase Sales</h3>
              <p className="text-[#333333]/70">
                Data-driven insights help you optimize your menu for profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#0B2C4D]/10 py-24">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="mt-4 text-lg text-[#333333]/70">
              Join hundreds of restaurants already using NoWaiter. Start your
              free trial today.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/menu?restaurant=elysium">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
