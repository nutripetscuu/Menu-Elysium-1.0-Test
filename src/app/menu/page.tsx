import { MenuPageClient } from "@/components/menu-page-client";
import { getRestaurantBySubdomain } from "@/lib/api/restaurants";

/**
 * Server Component - Multi-Tenant Restaurant Menu Page
 *
 * Determines which restaurant to show based on:
 * 1. Query parameter ?restaurant=<subdomain> (development)
 * 2. Subdomain subdomain.example.com (production)
 * 3. Custom domain customdomain.com (production)
 *
 * Examples:
 * - localhost:9002/menu?restaurant=myrestaurant → Queries DB for subdomain 'myrestaurant'
 * - localhost:9002/menu?restaurant=tokyo → Queries DB for subdomain 'tokyo'
 * - subdomain.nowaiter.com → Detects subdomain from domain
 */
export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Development: Use query parameter as subdomain
  const restaurantSubdomain = params.restaurant as string | undefined;

  // If no subdomain provided, show error (multi-tenant requires restaurant identification)
  if (!restaurantSubdomain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold mb-4">Restaurant Not Specified</h1>
        <p className="text-muted-foreground mb-2">
          Please specify a restaurant using the query parameter:
        </p>
        <code className="bg-muted px-4 py-2 rounded-md">
          /menu?restaurant=&lt;subdomain&gt;
        </code>
        <p className="text-sm text-muted-foreground mt-4">
          Example: /menu?restaurant=myrestaurant
        </p>
      </div>
    );
  }

  // Query database to find restaurant by subdomain
  const restaurant = await getRestaurantBySubdomain(restaurantSubdomain);

  // If restaurant not found, show error
  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
        <p className="text-muted-foreground mb-2">
          No restaurant found with subdomain: <strong>{restaurantSubdomain}</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check the subdomain and try again.
        </p>
      </div>
    );
  }

  // If restaurant is inactive, show maintenance page
  if (!restaurant.isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold mb-4">Restaurant Temporarily Unavailable</h1>
        <p className="text-muted-foreground mb-2">
          {restaurant.restaurantName} is currently unavailable.
        </p>
        <p className="text-sm text-muted-foreground">
          Please check back later.
        </p>
      </div>
    );
  }

  // Pass restaurant ID and subdomain to client component
  return <MenuPageClient restaurantId={restaurant.id} restaurantSlug={restaurantSubdomain} />;
}
