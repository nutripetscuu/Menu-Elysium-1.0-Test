'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Loader2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Show error from URL params (e.g., unauthorized)
    if (errorParam === 'unauthorized') {
      setError('You do not have admin access to this application.');
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN] Form submitted');
    setLoading(true);
    setError('');

    if (!email || !password) {
      console.log('[LOGIN] Missing email or password');
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    console.log('[LOGIN] Attempting sign in with email:', email);

    try {
      const supabase = createBrowserSupabaseClient();
      console.log('[LOGIN] Supabase client created');

      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[LOGIN] Sign in response:', { hasData: !!data, hasError: !!signInError });

      if (signInError) {
        console.log('[LOGIN] Sign in error:', signInError.message);
        setError(signInError.message || 'Failed to sign in. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Check if user is in admin_users table
      if (data.user) {
        console.log('[LOGIN] Checking admin status for user:', data.user.id);
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('[LOGIN] Admin check result:', { hasAdminUser: !!adminUser, error: adminError?.message });

        if (adminError || !adminUser) {
          // Not an admin - sign out and show error
          console.log('[LOGIN] User not in admin_users table');
          await supabase.auth.signOut();
          setError('You do not have admin access to this application.');
          setLoading(false);
          return;
        }
      }

      // Success - redirect to admin dashboard
      console.log('[LOGIN] Login successful, redirecting to:', redirectTo);
      // Wait a moment for cookies to be set, then redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      // Use window.location.href for a full page reload to ensure cookies are sent
      window.location.href = redirectTo;
    } catch (err) {
      console.error('[LOGIN] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Coffee className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">NoWaiter Admin</CardTitle>
          <CardDescription>Sign in to manage your restaurant menu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@elysium.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/reset-password"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up for free
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>
              This login is for existing restaurant owners. New to NoWaiter?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Create your account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
