'use client';

import { AuthProvider, useAuth } from '@/lib/hooks/admin/use-auth';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { AdminHeader } from '@/components/admin/layout/admin-header';
import { LiveMenuPreview } from '@/components/admin/live-menu-preview';
import { LivePreviewProvider, useLivePreview } from '@/lib/contexts/live-preview-context';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { refreshKey } = useLivePreview();
  const { adminUser } = useAuth();

  // Get the restaurant subdomain from the authenticated admin user
  // For development/testing, fallback to 'elysium' if no subdomain is set
  const restaurantSubdomain = adminUser?.restaurantSubdomain || 'elysium';

  console.log('[ADMIN LAYOUT] Admin user:', {
    hasAdminUser: !!adminUser,
    restaurantId: adminUser?.restaurantId,
    restaurantSubdomain: adminUser?.restaurantSubdomain,
    usingSubdomain: restaurantSubdomain
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-muted/10">
          {/* Main content with spacing for live preview */}
          <div className="container mx-auto p-6 xl:pr-[448px]">{children}</div>
        </main>
      </div>
      {/* Live Menu Preview - Fixed on the right side - Uses authenticated user's restaurant subdomain */}
      {restaurantSubdomain && (
        <LiveMenuPreview restaurantId={restaurantSubdomain} refreshKey={refreshKey} />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LivePreviewProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </LivePreviewProvider>
    </AuthProvider>
  );
}
