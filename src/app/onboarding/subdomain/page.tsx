'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coffee, AlertCircle, ArrowRight, ArrowLeft, CheckCircle, XCircle, Loader2, Globe } from 'lucide-react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';

export default function SubdomainPage() {
  const router = useRouter();
  const { subdomainData, setSubdomainData, currentStep, nextStep, previousStep } = useOnboarding();

  const [subdomain, setSubdomain] = useState(subdomainData.subdomain);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time availability check with debounce
  useEffect(() => {
    if (!subdomain) {
      setIsAvailable(null);
      setError('');
      return;
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (subdomain.length < 3) {
      setIsAvailable(null);
      setError('Subdomain must be at least 3 characters long');
      return;
    }

    if (subdomain.length > 63) {
      setIsAvailable(null);
      setError('Subdomain must be less than 63 characters');
      return;
    }

    if (!subdomainRegex.test(subdomain)) {
      setIsAvailable(null);
      setError('Subdomain can only contain lowercase letters, numbers, and hyphens (not at start/end)');
      return;
    }

    setError('');
    setIsChecking(true);

    // Debounce the availability check
    const timer = setTimeout(async () => {
      try {
        // Real API call to check subdomain availability
        const response = await fetch('/api/onboarding/check-subdomain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subdomain: subdomain.toLowerCase() }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsAvailable(data.available);
          if (!data.available && data.message) {
            setError(data.message);
          }
        } else {
          setIsAvailable(null);
          setError(data.error || 'Failed to check subdomain availability');
        }
      } catch (error) {
        console.error('Error checking subdomain:', error);
        setIsAvailable(null);
        setError('Network error. Please try again.');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain]);

  const handleSubdomainChange = (value: string) => {
    // Convert to lowercase and remove invalid characters as user types
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(cleaned);
  };

  const validateForm = () => {
    setError('');

    if (!subdomain) {
      setError('Please enter a subdomain');
      return false;
    }

    if (isAvailable === false) {
      setError('This subdomain is already taken. Please choose another one.');
      return false;
    }

    if (isAvailable === null) {
      setError('Please wait for availability check to complete');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Save to context
    setSubdomainData({
      subdomain,
      isAvailable: true,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Move to next step
    nextStep();
    router.push('/onboarding/plan');
  };

  const handleBack = () => {
    previousStep();
    router.push('/onboarding/restaurant');
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
      <div className="container max-w-2xl mx-auto px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Choose Your Subdomain</CardTitle>
            <CardDescription>
              This will be your restaurant's unique web address
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && !(isAvailable !== null) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Subdomain Input */}
              <div className="space-y-2">
                <Label htmlFor="subdomain">Your Subdomain</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="subdomain"
                      placeholder="your-restaurant"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      disabled={loading}
                      className="pr-10"
                      autoFocus
                    />
                    {/* Status icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isChecking && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {!isChecking && isAvailable === true && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {!isChecking && isAvailable === false && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Availability message */}
                {!isChecking && isAvailable === true && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Great! This subdomain is available</span>
                  </div>
                )}
                {!isChecking && isAvailable === false && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>Sorry, this subdomain is already taken</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Use lowercase letters, numbers, and hyphens only (3-63 characters)
                </p>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Your Menu URL</Label>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">https://</span>
                    <span className="font-mono font-medium text-foreground">
                      {subdomain || 'your-restaurant'}
                    </span>
                    <span className="text-muted-foreground">.nowaiter.com</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your customers will use this URL to access your menu
                </p>
              </div>

              {/* Info box */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Choose something memorable and easy to share with your customers.
                  You can use your restaurant name, location, or specialty cuisine.
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
                <Button
                  type="submit"
                  disabled={loading || isChecking || isAvailable !== true}
                  className="flex-1 bg-[#C41E3A] hover:bg-[#C41E3A]/90 text-white"
                >
                  {loading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      Continue
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
