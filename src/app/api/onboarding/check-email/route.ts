import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * Check if an email is already registered in the system
 * This prevents users from going through the entire signup flow and payment
 * only to find out their email is already taken
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user exists in Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      // Check if user has completed onboarding (has a restaurant)
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('subdomain')
        .eq('billing_email', email.toLowerCase())
        .single();

      if (restaurant) {
        return NextResponse.json({
          available: false,
          reason: 'registered',
          message: `This email is already registered. Please login instead.`,
          subdomain: restaurant.subdomain,
        });
      }

      // User exists but hasn't completed onboarding (payment might have failed)
      return NextResponse.json({
        available: true,
        warning: 'incomplete',
        message: 'You started signup before. You can continue with this email.',
      });
    }

    // Email is available
    return NextResponse.json({
      available: true,
    });
  } catch (error: any) {
    console.error('[EMAIL CHECK API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
