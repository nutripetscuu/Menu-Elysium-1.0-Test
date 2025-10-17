"use client";

import { useLivePreview } from '@/lib/contexts/live-preview-context';
import { useCallback } from 'react';

/**
 * Hook to trigger a refresh of the live menu preview
 * Use this after making changes to categories, menu items, or other menu data
 *
 * @example
 * ```tsx
 * const refreshPreview = useRefreshPreview();
 *
 * const handleSave = async () => {
 *   await saveChanges();
 *   refreshPreview(); // Refresh the preview after saving
 * };
 * ```
 */
export function useRefreshPreview() {
  const { refreshPreview } = useLivePreview();

  return useCallback(() => {
    // Add a small delay to allow database changes to propagate
    setTimeout(() => {
      refreshPreview();
    }, 500);
  }, [refreshPreview]);
}
