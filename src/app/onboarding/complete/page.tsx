'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, CheckCircle, ArrowRight, Globe, Settings, BarChart, Menu, Loader2, Download } from 'lucide-react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const nextSteps = [
  {
    icon: Menu,
    title: 'Add Menu Items',
    description: 'Start building your menu with categories and items',
    color: 'text-blue-500',
  },
  {
    icon: Settings,
    title: 'Customize Settings',
    description: 'Configure your restaurant hours, contact info, and branding',
    color: 'text-purple-500',
  },
  {
    icon: Globe,
    title: 'Share Your Menu',
    description: 'Get your QR code and share your menu with customers',
    color: 'text-green-500',
  },
  {
    icon: BarChart,
    title: 'Track Analytics',
    description: 'Monitor views, popular items, and customer insights',
    color: 'text-orange-500',
  },
];

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signupData, restaurantData, subdomainData, planData, currentStep, setCurrentStep } = useOnboarding();

  const [provisioning, setProvisioning] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [restaurantId, setRestaurantId] = useState<string>('');

  useEffect(() => {
    // Ensure we're on step 5
    if (currentStep !== 5) {
      setCurrentStep(5);
    }
  }, [currentStep, setCurrentStep]);

  useEffect(() => {
    // Trigger provisioning when component mounts
    const provisionAccount = async () => {
      try {
        console.log('[COMPLETE PAGE] Starting provisioning...');
        console.log('[COMPLETE PAGE] Signup data:', signupData);
        console.log('[COMPLETE PAGE] Restaurant data:', restaurantData);
        console.log('[COMPLETE PAGE] Subdomain data:', subdomainData);
        console.log('[COMPLETE PAGE] Plan data:', planData);

        // Get session_id from Stripe redirect
        const sessionId = searchParams.get('session_id');
        console.log('[COMPLETE PAGE] Stripe session ID:', sessionId);

        // Call provisioning API
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password,
            phone: signupData.phone,
            restaurantName: restaurantData.restaurantName,
            businessName: restaurantData.businessName,
            addressLine1: restaurantData.addressLine1,
            addressLine2: restaurantData.addressLine2,
            city: restaurantData.city,
            state: restaurantData.state,
            postalCode: restaurantData.postalCode,
            country: restaurantData.country,
            cuisineType: restaurantData.cuisineType,
            operatingHours: restaurantData.operatingHours,
            logoUrl: restaurantData.logoUrl,
            subdomain: subdomainData.subdomain,
            plan: planData.tier,
            billingCycle: planData.billingCycle,
            stripeSessionId: sessionId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to provision restaurant');
        }

        const data = await response.json();
        console.log('[COMPLETE PAGE] Provisioning successful:', data);

        setQrCodeDataUrl(data.qrCodeDataUrl);
        setRestaurantId(data.restaurantId);
        setProvisioning(false);
      } catch (error: any) {
        console.error('[COMPLETE PAGE] Provisioning error:', error);
        setError(error.message || 'Failed to create your restaurant account');
        setProvisioning(false);
      }
    };

    // Only provision if we have the required data
    if (signupData.email && restaurantData.restaurantName && subdomainData.subdomain) {
      provisionAccount();
    } else {
      setError('Missing required onboarding data. Please start over.');
      setProvisioning(false);
    }
  }, []);

  const handleGoToDashboard = async () => {
    try {
      // Auto-login the user with their credentials
      console.log('[COMPLETE PAGE] Auto-logging in user...');

      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password,
      });

      if (error) {
        console.error('[COMPLETE PAGE] Auto-login failed:', error);
        // Fallback to manual login
        router.push('/login?message=Please login with your credentials');
        return;
      }

      console.log('[COMPLETE PAGE] Auto-login successful, redirecting to dashboard...');
      // Wait a moment for session to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      // Use window.location for full page reload to ensure auth cookies are set
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('[COMPLETE PAGE] Error during auto-login:', error);
      router.push('/login');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${subdomainData.subdomain}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state
  if (provisioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Setting up your restaurant...</h3>
                <p className="text-sm text-muted-foreground">
                  We're creating your account, menu, and QR code. This will just take a moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => router.push('/signup')} variant="outline" className="flex-1">
                Start Over
              </Button>
              <Button onClick={() => router.push('/login')} className="flex-1">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">NoWaiter</span>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <OnboardingProgress currentStep={5} />

      {/* Success Content */}
      <div className="container max-w-3xl mx-auto px-4 pb-12">
        <Card>
          <CardHeader className="text-center space-y-4">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/10 p-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl">Welcome to NoWaiter! 🎉</CardTitle>
              <CardDescription className="text-lg">
                Your account has been created successfully
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Summary */}
            <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
              <h3 className="font-semibold text-lg">Your Account Details</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Restaurant Name</p>
                  <p className="font-medium">{restaurantData.restaurantName || 'Your Restaurant'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">
                    {planData.tier === 'basic' ? 'Basic' :
                     planData.tier === 'professional' ? 'Plus' :
                     planData.tier === 'enterprise' ? 'Enterprise' : 'Trial'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Your Menu URL</p>
                  <Link
                    href={`/menu?restaurant=${restaurantId}`}
                    target="_blank"
                    className="font-medium text-primary break-all hover:underline"
                  >
                    {process.env.NODE_ENV === 'production'
                      ? `${subdomainData.subdomain}.nowaiter.com`
                      : `localhost:9002/menu?restaurant=${restaurantId}`}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to view your menu
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trial Period</p>
                  <p className="font-medium">7 days free</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {qrCodeDataUrl && (
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Your Menu QR Code</h3>
                  <Button onClick={handleDownloadQR} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <img
                        src={qrCodeDataUrl}
                        alt="Menu QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Print this QR code</strong> and place it on your:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Restaurant tables</li>
                      <li>Counter or checkout area</li>
                      <li>Storefront window</li>
                      <li>Marketing materials</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 Tip: You can also download a high-resolution version from your admin panel
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Next Steps</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {nextSteps.map((step, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className={`${step.color} mt-1`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What Happens Next */}
            <div className="rounded-lg border bg-primary/5 p-6 space-y-3">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>You'll receive a confirmation email with your account details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Your 7-day free trial starts immediately - no credit card required yet</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>We'll send you a reminder 2 days before your trial ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Our support team is here to help you get started</span>
                </li>
              </ul>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleGoToDashboard} size="lg" className="w-full">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Need help getting started?{' '}
                <Link href="/help" className="text-primary hover:underline">
                  Visit our help center
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Have questions? Email us at{' '}
            <a href="mailto:support@nowaiter.com" className="text-primary hover:underline">
              support@nowaiter.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
