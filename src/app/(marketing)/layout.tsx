import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#0B2C4D]/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="container max-w-screen-2xl mx-auto px-6">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/branding/nowaiter-logo.png"
                alt="NoWaiter - Restaurant Management Made Simple"
                width={256}
                height={64}
                className="h-16 w-auto"
                priority
                quality={100}
              />
            </Link>

            {/* Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center space-x-8 text-base font-medium flex-1">
              <Link
                href="/features"
                className="transition-colors hover:text-[#0B2C4D] text-[#333333]/70 font-medium leading-none"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="transition-colors hover:text-[#0B2C4D] text-[#333333]/70 font-medium leading-none"
              >
                Pricing
              </Link>
              <Link
                href="/menu?restaurant=elysium"
                className="transition-colors hover:text-[#0B2C4D] text-[#333333]/70 font-medium leading-none"
              >
                Demo
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center justify-end space-x-4 flex-shrink-0">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="hidden md:inline-flex text-[#0B2C4D] hover:bg-[#0B2C4D]/10"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white font-semibold">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#0B2C4D]/10 bg-[#0B2C4D]">
        <div className="container max-w-screen-2xl py-12 md:py-16 px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/menu?restaurant=elysium"
                    className="hover:text-white transition-colors"
                  >
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 border-t border-white/20 pt-8 text-center text-sm text-white/60">
            <p>© 2025 NoWaiter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
