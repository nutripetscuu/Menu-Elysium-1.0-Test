import { NextRequest, NextResponse } from 'next/server';
import { provisionRestaurant, ProvisioningData } from '@/lib/provisioning/restaurant-provisioning';

export async function POST(request: NextRequest) {
  console.log('[ONBOARDING API] Complete endpoint called');

  try {
    console.log('[ONBOARDING API] Parsing request body...');
    const body = await request.json();
    console.log('[ONBOARDING API] Request body:', JSON.stringify(body, null, 2));

    // Validate required fields (businessName is optional, will use restaurantName as fallback)
    const requiredFields = [
      'email',
      'password',
      'phone',
      'restaurantName',
      'addressLine1',
      'city',
      'state',
      'postalCode',
      'country',
      'subdomain',
      'plan',
      'billingCycle',
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      console.error('[ONBOARDING API] Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare provisioning data
    const provisioningData: ProvisioningData = {
      email: body.email,
      password: body.password,
      phone: body.phone,
      restaurantName: body.restaurantName,
      businessName: body.businessName || body.restaurantName, // Fallback to restaurantName if not provided
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      state: body.state,
      postalCode: body.postalCode,
      country: body.country,
      cuisineType: body.cuisineType || [],
      operatingHours: body.operatingHours || getDefaultOperatingHours(),
      logoUrl: body.logoUrl,
      subdomain: body.subdomain,
      plan: body.plan,
      billingCycle: body.billingCycle,
      stripeCustomerId: body.stripeCustomerId,
      stripeSubscriptionId: body.stripeSubscriptionId,
    };

    console.log('[ONBOARDING API] Starting provisioning...');
    const result = await provisionRestaurant(provisioningData);

    if (!result.success) {
      console.error('[ONBOARDING API] Provisioning failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to provision restaurant' },
        { status: 500 }
      );
    }

    console.log('[ONBOARDING API] ✅ Provisioning successful');
    return NextResponse.json({
      success: true,
      restaurantId: result.restaurantId,
      userId: result.userId,
      qrCodeDataUrl: result.qrCodeDataUrl,
      message: 'Restaurant provisioned successfully',
    });
  } catch (error: any) {
    console.error('[ONBOARDING API] ❌ Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

function getDefaultOperatingHours() {
  return {
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '09:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false },
  };
}
