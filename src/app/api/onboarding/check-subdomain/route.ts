import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * Check if a subdomain is available
 * This prevents users from going through the entire signup flow and payment
 * only to find out their subdomain is already taken
 */
export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json();

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
    }

    // Validate subdomain format (lowercase alphanumeric and hyphens only)
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Check length
    if (subdomain.length < 3 || subdomain.length > 63) {
      return NextResponse.json(
        { error: 'Subdomain must be between 3 and 63 characters' },
        { status: 400 }
      );
    }

    // Reserved subdomains (admin, system, etc.)
    const reservedSubdomains = [
      'www',
      'admin',
      'api',
      'app',
      'dashboard',
      'mail',
      'smtp',
      'ftp',
      'webmail',
      'support',
      'help',
      'blog',
      'forum',
      'shop',
      'store',
      'cdn',
      'static',
      'assets',
      'media',
      'files',
      'download',
      'upload',
      'test',
      'staging',
      'dev',
      'demo',
      'beta',
      'alpha',
      'prod',
      'production',
      'localhost',
      'nowaiter',
      'menu',
      'order',
      'checkout',
      'payment',
      'billing',
      'account',
      'settings',
      'profile',
      'login',
      'signup',
      'register',
      'auth',
      'oauth',
      'sso',
    ];

    if (reservedSubdomains.includes(subdomain.toLowerCase())) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        message: 'This subdomain is reserved for system use',
      });
    }

    const supabase = createAdminClient();

    // Check if subdomain exists in restaurants table
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id, restaurant_name')
      .eq('subdomain', subdomain.toLowerCase())
      .single();

    if (existingRestaurant) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        message: 'This subdomain is already taken',
      });
    }

    // Subdomain is available
    return NextResponse.json({
      available: true,
      message: 'Subdomain is available',
    });
  } catch (error: any) {
    console.error('[SUBDOMAIN CHECK API] Error:', error);

    // If error is "not found" from single(), that means subdomain is available
    if (error.code === 'PGRST116' || error.message?.includes('JSON object requested')) {
      return NextResponse.json({
        available: true,
        message: 'Subdomain is available',
      });
    }

    return NextResponse.json(
      { error: 'Failed to check subdomain availability' },
      { status: 500 }
    );
  }
}
