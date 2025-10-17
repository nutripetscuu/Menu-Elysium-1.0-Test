'use client';

import { AuthProvider } from '@/lib/hooks/admin/use-auth';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { AdminHeader } from '@/components/admin/layout/admin-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto bg-muted/10">
            <div className="container mx-auto p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
