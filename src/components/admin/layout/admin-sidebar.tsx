'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRestaurantSlug } from '@/lib/hooks/use-restaurant-slug';
import {
  Home,
  Grid,
  Package,
  Sliders,
  Image,
  Settings,
  Eye,
  Coffee,
  Download,
} from 'lucide-react';
import { generateQRCodeDataURL, downloadQRCodeClient } from '@/lib/utils/download-qr-code-client';
import { getMenuUrl, getRestaurantSubdomain } from '@/lib/actions/settings';

const navItems = [
  {
    href: '/admin/dashboard',
    icon: Home,
    label: 'Dashboard',
    description: 'Overview and quick stats',
  },
  {
    href: '/admin/categories',
    icon: Grid,
    label: 'Categories',
    description: 'Manage menu categories',
  },
  {
    href: '/admin/menu-items',
    icon: Package,
    label: 'Menu Items',
    description: 'Manage food and drinks',
  },
  {
    href: '/admin/modifiers',
    icon: Sliders,
    label: 'Modifiers',
    description: 'Customization options',
  },
  {
    href: '/admin/promotions',
    icon: Image,
    label: 'Promotions',
    description: 'Carousel images',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: 'Settings',
    description: 'Restaurant configuration',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { slug } = useRestaurantSlug();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Load QR code on mount
  useEffect(() => {
    const loadQRCode = async () => {
      try {
        const url = await getMenuUrl();
        setMenuUrl(url);
        const qr = await generateQRCodeDataURL(url);
        setQrCodeUrl(qr);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    loadQRCode();
  }, []);

  // Handle QR code download
  const handleDownloadQR = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const [url, subdomain] = await Promise.all([
        getMenuUrl(),
        getRestaurantSubdomain()
      ]);
      await downloadQRCodeClient(url, subdomain);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <aside className="w-64 border-r bg-muted/10 h-screen overflow-y-auto sticky top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Coffee className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">NoWaiter</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-muted group',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 mt-0.5 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <div className="flex-1">
                <div className={cn('font-medium', isActive && 'text-primary-foreground')}>
                  {item.label}
                </div>
                <div
                  className={cn(
                    'text-xs',
                    isActive
                      ? 'text-primary-foreground/80'
                      : 'text-muted-foreground group-hover:text-foreground/80'
                  )}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* View Public Menu Link */}
      <div className="p-4 border-t mt-auto">
        <Link
          href={`/menu?restaurant=${slug}`}
          target="_blank"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>View Public Menu</span>
        </Link>
      </div>

      {/* QR Code Quick Access */}
      {qrCodeUrl && (
        <div className="p-4 border-t bg-muted/20">
          <div className="text-xs font-medium text-muted-foreground mb-3">
            Menu QR Code
          </div>
          <div className="bg-white rounded-lg p-3 mb-3 flex justify-center">
            <img
              src={qrCodeUrl}
              alt="Menu QR Code"
              className="w-32 h-32"
            />
          </div>
          <button
            onClick={handleDownloadQR}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download QR'}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
