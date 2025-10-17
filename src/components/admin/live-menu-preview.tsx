"use client";

import { useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LiveMenuPreviewProps {
  restaurantId?: string;
  refreshKey?: number;
}

export function LiveMenuPreview({ restaurantId, refreshKey = 0 }: LiveMenuPreviewProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Construct the menu URL
  const menuUrl = restaurantId
    ? `/menu?restaurant=${restaurantId}`
    : '/menu?restaurant=elysium';

  // Refresh iframe when refreshKey OR restaurantId changes
  useEffect(() => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  }, [refreshKey, restaurantId]);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed right-6 top-20 bottom-6 w-[400px] hidden xl:block z-30">
      <div className="h-full bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
        {/* Simple header with icon and title */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Live Preview</span>
        </div>

        {/* Preview content */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-[#C41E3A]" />
                <p className="text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}

          {/* Iframe - no sandbox restrictions for localhost */}
          <iframe
            key={iframeKey}
            src={menuUrl}
            className="w-full h-full border-0"
            title="Live Menu Preview"
            onLoad={handleIframeLoad}
          />

          {/* Floating action buttons */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button
              onClick={handleRefresh}
              size="icon"
              className="h-10 w-10 rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              title="Refresh preview"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href={menuUrl} target="_blank">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Simple footer */}
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-center text-gray-500">
            Changes may take a few seconds to appear
          </p>
        </div>
      </div>
    </div>
  );
}
