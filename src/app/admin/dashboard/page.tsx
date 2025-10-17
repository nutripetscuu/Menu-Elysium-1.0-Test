'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/admin/use-auth';
import { useRestaurantSlug } from '@/lib/hooks/use-restaurant-slug';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Grid,
  Sliders,
  Image as ImageIcon,
  Plus,
  Eye,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings,
  Sparkles,
  Gift,
  FileText,
  BookOpen,
  Zap,
} from 'lucide-react';
import {
  getDashboardStats,
  getRecentActivity,
  getMenuUrl,
  getRestaurantSubdomain,
} from '@/lib/actions/dashboard';
import { downloadQRCodeClient } from '@/lib/utils/download-qr-code-client';
import type { DashboardStats, RecentActivity } from '@/lib/api/dashboard';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const { adminUser } = useAuth();
  const { slug, loading: slugLoading } = useRestaurantSlug();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(8),
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Handle QR code download
  const handleDownloadQR = async () => {
    try {
      const [menuUrl, subdomain] = await Promise.all([
        getMenuUrl(),
        getRestaurantSubdomain(),
      ]);
      await downloadQRCodeClient(menuUrl, subdomain);
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  // Format timestamp for activity feed
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'menu_item_created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'menu_item_updated':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'availability_changed':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statsCards = [
    {
      title: 'Total Menu Items',
      value: stats?.totalMenuItems || 0,
      description: 'All items in menu',
      icon: Package,
      href: '/admin/menu-items',
      color: 'text-blue-600',
    },
    {
      title: 'Active Items',
      value: stats?.activeMenuItems || 0,
      description: 'Currently available',
      icon: CheckCircle2,
      href: '/admin/menu-items',
      color: 'text-green-600',
    },
    {
      title: 'Unavailable Items',
      value: stats?.unavailableMenuItems || 0,
      description: 'Temporarily hidden',
      icon: AlertCircle,
      href: '/admin/menu-items',
      color: 'text-orange-600',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      description: 'Menu sections',
      icon: Grid,
      href: '/admin/categories',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Welcome to NoWaiter Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            {adminUser
              ? `Good to see you, ${adminUser.email.split('@')[0]}! `
              : 'Welcome back! '}
            Manage your restaurant menu with ease.
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Online
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Jump into common tasks to manage your menu</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/menu-items"
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Add New Item</h3>
              <p className="text-sm text-muted-foreground">Create menu item</p>
            </div>
          </Link>

          <Link
            href="/admin/promotions"
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Manage Promotions</h3>
              <p className="text-sm text-muted-foreground">Update carousel</p>
            </div>
          </Link>

          <a
            href={`/menu?restaurant=${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-1">
                View Public Menu
                <ExternalLink className="h-3 w-3" />
              </h3>
              <p className="text-sm text-muted-foreground">See live menu</p>
            </div>
          </a>

          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted hover:border-primary/50 transition-all group text-left"
          >
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Download QR Code</h3>
              <p className="text-sm text-muted-foreground">Share your menu</p>
            </div>
          </button>

          <Link
            href="/admin/settings"
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium">Restaurant Settings</h3>
              <p className="text-sm text-muted-foreground">Configure details</p>
            </div>
          </Link>

          <Link
            href="/admin/modifiers"
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
              <Sliders className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium">Manage Modifiers</h3>
              <p className="text-sm text-muted-foreground">Customization options</p>
            </div>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest changes to your menu</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm">Start by adding menu items!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-1.5 bg-background border rounded">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started & Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Getting Started
            </CardTitle>
            <CardDescription>Learn how to use the admin panel effectively</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Quick Start Guide</h3>
              <p className="text-sm text-muted-foreground">
                The NoWaiter Admin Panel lets you manage your restaurant menu in real-time. Changes appear
                instantly on the public menu.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">Key Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <Grid className="h-4 w-4 mt-0.5 text-purple-600" />
                  <span>
                    <strong>Categories:</strong> Organize your menu into sections
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>
                    <strong>Menu Items:</strong> Add items with prices, images, and descriptions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Sliders className="h-4 w-4 mt-0.5 text-indigo-600" />
                  <span>
                    <strong>Modifiers:</strong> Create customizable options (sizes, toppings, etc.)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ImageIcon className="h-4 w-4 mt-0.5 text-pink-600" />
                  <span>
                    <strong>Promotions:</strong> Upload carousel images for the homepage
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Settings className="h-4 w-4 mt-0.5 text-orange-600" />
                  <span>
                    <strong>Settings:</strong> Configure restaurant details and business hours
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/categories">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Building Your Menu
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modifier Groups</CardTitle>
            <Sliders className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalModifiers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Customization groups</p>
            <Button variant="link" className="px-0 mt-2 h-auto" asChild>
              <Link href="/admin/modifiers">Manage Modifiers →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotional Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalPromotions || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Carousel images</p>
            <Button variant="link" className="px-0 mt-2 h-auto" asChild>
              <Link href="/admin/promotions">Manage Promotions →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
