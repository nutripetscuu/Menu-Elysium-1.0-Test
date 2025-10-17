import { createAdminClient } from '@/lib/supabase/admin-client';
import { generateMenuQRCode } from './qr-code';
import { sendWelcomeEmail } from './email';

export interface ProvisioningData {
  // Signup data
  email: string;
  password: string;
  phone: string;

  // Restaurant data
  restaurantName: string;
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  cuisineType: string[];
  operatingHours: Record<string, { open: string; close: string; closed: boolean }>;
  logoUrl?: string;

  // Subdomain data
  subdomain: string;

  // Plan data
  plan: 'basic' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface ProvisioningResult {
  success: boolean;
  restaurantId?: string;
  userId?: string;
  qrCodeDataUrl?: string;
  error?: string;
}

/**
 * Main provisioning function - creates restaurant and all related records
 */
export async function provisionRestaurant(
  data: ProvisioningData
): Promise<ProvisioningResult> {
  const supabase = createAdminClient();

  console.log('[PROVISIONING] Starting restaurant provisioning for:', data.subdomain);

  try {
    // Step 1: Check if auth user already exists (idempotency)
    console.log('[PROVISIONING] Checking if user already exists...');
    let userId: string;
    let userAlreadyExists = false;

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === data.email);

    if (existingUser) {
      console.log('[PROVISIONING] User already exists:', existingUser.id);
      userId = existingUser.id;
      userAlreadyExists = true;

      // Check if user already has a restaurant
      const { data: existingRestaurant } = await supabase
        .from('restaurants')
        .select('id, subdomain')
        .eq('billing_email', data.email)
        .single();

      if (existingRestaurant) {
        console.log('[PROVISIONING] User already has a restaurant:', existingRestaurant.id);
        throw new Error(
          `This email is already registered with subdomain "${existingRestaurant.subdomain}". Please login instead.`
        );
      }

      console.log('[PROVISIONING] User exists but has no restaurant. Completing provisioning...');
    } else {
      // Create new auth user
      console.log('[PROVISIONING] Creating new auth user...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          restaurant_name: data.restaurantName,
          phone: data.phone,
        },
      });

      if (authError || !authData.user) {
        console.error('[PROVISIONING] Error creating auth user:', authError);
        throw new Error(`Failed to create user: ${authError?.message || 'Unknown error'}`);
      }

      userId = authData.user.id;
      console.log('[PROVISIONING] Auth user created:', userId);
    }

    // Step 2: Check if subdomain is already taken (defensive check)
    console.log('[PROVISIONING] Checking subdomain availability...');
    const { data: existingSubdomain } = await supabase
      .from('restaurants')
      .select('id, subdomain, restaurant_name')
      .eq('subdomain', data.subdomain.toLowerCase())
      .single();

    if (existingSubdomain) {
      console.error('[PROVISIONING] Subdomain already taken:', existingSubdomain.subdomain);

      // IMPORTANT: Only cleanup if we just created the user
      if (!userAlreadyExists) {
        console.log('[PROVISIONING] Cleaning up newly created user due to subdomain conflict');
        await supabase.auth.admin.deleteUser(userId);
      }

      throw new Error(
        `The subdomain "${data.subdomain}" is already taken. This should have been caught earlier. Please contact support.`
      );
    }

    // Step 3: Create restaurant record
    console.log('[PROVISIONING] Creating restaurant record...');
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        restaurant_name: data.restaurantName,
        business_name: data.businessName || data.restaurantName,
        subdomain: data.subdomain.toLowerCase(),
        subscription_tier: data.plan,
        subscription_status: 'active',
        billing_email: data.email,
        phone: data.phone,
        email: data.email,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country,
        cuisine_type: data.cuisineType,
        operating_hours: data.operatingHours,
        logo_url: data.logoUrl,
        is_active: true,
        is_verified: true,
        onboarding_completed: true,
      })
      .select()
      .single();

    if (restaurantError || !restaurant) {
      console.error('[PROVISIONING] Error creating restaurant:', restaurantError);

      // IMPORTANT: Only cleanup if we just created the user (not if user already existed)
      // If user already existed and paid, we should NOT delete them
      if (!userAlreadyExists) {
        console.log('[PROVISIONING] Cleaning up newly created user due to restaurant creation failure');
        await supabase.auth.admin.deleteUser(userId);
      } else {
        console.log('[PROVISIONING] User already existed, skipping cleanup. Manual intervention needed.');
      }

      throw new Error(`Failed to create restaurant: ${restaurantError?.message || 'Unknown error'}`);
    }

    const restaurantId = restaurant.id;
    console.log('[PROVISIONING] Restaurant created:', restaurantId);

    // Step 4: Create admin user record
    console.log('[PROVISIONING] Creating admin user record...');
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .insert({
        id: userId, // Use same ID as auth user
        email: data.email,
        role: 'admin',
        restaurant_id: restaurantId,
        is_super_admin: false,
      });

    if (adminUserError) {
      console.error('[PROVISIONING] Error creating admin user:', adminUserError);
      // Continue anyway - this is not critical
    } else {
      console.log('[PROVISIONING] Admin user record created');
    }

    // Step 5: Create restaurant settings
    console.log('[PROVISIONING] Creating restaurant settings...');
    const { error: settingsError } = await supabase
      .from('restaurant_settings')
      .insert({
        restaurant_id: restaurantId,
        restaurant_name: data.restaurantName,
        business_hours: data.operatingHours,
        logo_url: data.logoUrl,
        online_ordering_enabled: true,
      });

    if (settingsError) {
      console.error('[PROVISIONING] Error creating settings:', settingsError);
      // Continue anyway
    }

    // Step 6: Create subscription record (if coming from Stripe)
    if (data.stripeCustomerId) {
      console.log('[PROVISIONING] Creating subscription record...');
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          restaurant_id: restaurantId,
          stripe_customer_id: data.stripeCustomerId,
          stripe_subscription_id: data.stripeSubscriptionId,
          plan: data.plan,
          status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
        });

      if (subError) {
        console.error('[PROVISIONING] Error creating subscription:', subError);
        // Continue anyway
      }
    }

    // Step 7: Create default categories
    console.log('[PROVISIONING] Creating default categories...');
    await createDefaultCategories(restaurantId);

    // Step 8: Generate QR code
    console.log('[PROVISIONING] Generating QR code...');
    const qrCodeDataUrl = await generateMenuQRCode(data.subdomain, restaurantId);

    // Step 9: Update restaurant with QR code (store in metadata)
    await supabase
      .from('restaurants')
      .update({
        metadata: {
          qr_code: qrCodeDataUrl,
          qr_generated_at: new Date().toISOString(),
        },
      })
      .eq('id', restaurantId);

    // Step 10: Send welcome email
    console.log('[PROVISIONING] Sending welcome email...');
    const adminPanelUrl = process.env.NODE_ENV === 'production'
      ? 'https://admin.nowaiter.app'
      : 'http://localhost:9002/admin/dashboard';

    const menuUrl = process.env.NODE_ENV === 'production'
      ? `https://${data.subdomain}.nowaiter.app/menu`
      : `http://localhost:9002/menu?restaurant=${restaurantId}`;

    await sendWelcomeEmail({
      restaurantName: data.restaurantName,
      ownerEmail: data.email,
      subdomain: data.subdomain,
      adminPanelUrl,
      menuUrl,
      qrCodeDataUrl,
    });

    console.log('[PROVISIONING] ✅ Provisioning completed successfully!');

    return {
      success: true,
      restaurantId,
      userId,
      qrCodeDataUrl,
    };
  } catch (error: any) {
    console.error('[PROVISIONING] ❌ Provisioning failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Create default menu categories for new restaurant
 */
async function createDefaultCategories(restaurantId: string): Promise<void> {
  const supabase = createAdminClient();

  const defaultCategories = [
    { name: 'Beverages', icon: 'Coffee', position: 0 },
    { name: 'Food', icon: 'UtensilsCrossed', position: 1 },
    { name: 'Desserts', icon: 'IceCream', position: 2 },
    { name: 'Specials', icon: 'Star', position: 3 },
  ];

  const { error } = await supabase
    .from('categories')
    .insert(
      defaultCategories.map((cat) => ({
        ...cat,
        restaurant_id: restaurantId,
        is_active: true,
      }))
    );

  if (error) {
    console.error('[PROVISIONING] Error creating default categories:', error);
    // Don't throw - categories can be created later
  } else {
    console.log('[PROVISIONING] Default categories created');
  }
}
