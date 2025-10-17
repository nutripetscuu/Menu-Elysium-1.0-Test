import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from './lib/types/database';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const pathname = req.nextUrl.pathname;

  console.log('[MIDDLEWARE] Request to:', pathname);

  // Check if accessing admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/reset-password', '/signup'].includes(pathname);

  if (isAdminRoute && !isAuthPage) {
    // Get authenticated user (secure method that validates with Auth server)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('[MIDDLEWARE] User authenticated:', !!user);

    if (authError || !user) {
      // Not logged in or invalid token → redirect to login
      console.log('[MIDDLEWARE] No authenticated user, redirecting to login');
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is an admin
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('[MIDDLEWARE] Admin user found:', !!adminUser, 'Error:', error?.message);

    if (error || !adminUser) {
      // User exists in Supabase Auth but not in admin_users table
      console.log('[MIDDLEWARE] User not in admin_users, redirecting to login');
      await supabase.auth.signOut();
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl);
    }

    console.log('[MIDDLEWARE] User is admin, allowing access');
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  // BUT: Don't redirect if this is part of a logout flow (user might be signing out)
  if (isAuthPage && pathname === '/login') {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if there's a 'logout' search param to indicate logout in progress
      const isLoggingOut = req.nextUrl.searchParams.get('logout') === 'true';

      if (!isLoggingOut) {
        console.log('[MIDDLEWARE] Already logged in, redirecting to dashboard');
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      } else {
        console.log('[MIDDLEWARE] Logout in progress, allowing access to login page');
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/reset-password',
    '/signup',
  ],
};
