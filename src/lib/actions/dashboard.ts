'use server';

// Server Actions for dashboard data (admin panel)

import {
  getDashboardStats as apiGetDashboardStats,
  getRecentActivity as apiGetRecentActivity,
  getMenuUrl as apiGetMenuUrl,
  getRestaurantSubdomain as apiGetRestaurantSubdomain,
} from '@/lib/api/dashboard';
import type { DashboardStats, RecentActivity } from '@/lib/api/dashboard';

// Note: Types cannot be re-exported from 'use server' files
// Import these types directly from '@/lib/api/dashboard' in your components

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiGetDashboardStats();
}

export async function getRecentActivity(limit?: number): Promise<RecentActivity[]> {
  return apiGetRecentActivity(limit);
}

export async function getMenuUrl(): Promise<string> {
  return await apiGetMenuUrl();
}

export async function getRestaurantSubdomain(): Promise<string> {
  return await apiGetRestaurantSubdomain();
}
