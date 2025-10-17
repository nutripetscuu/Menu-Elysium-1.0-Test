"use client";

import { useEffect, useState } from "react";
import { BannerCarousel } from "./banner-carousel";
import { LoadingSpinner } from "./ui/loading-spinner";
import { supabase } from "@/lib/supabase/client";

// Promotional image type (from API - uses snake_case)
interface PromotionalImage {
  id: string;
  image_url: string;
  title?: string | null;
  description?: string | null;
  link_url?: string | null;
  link_menu_item_id?: string | null;
  position: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// Convert PromotionalImage to BannerImage format for the carousel
interface BannerImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface PromoBannerProps {
  restaurantId: string;
}

export function PromoBanner({ restaurantId }: PromoBannerProps) {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBannerImages = async () => {
      try {
        setLoading(true);
        console.log(`[PROMO BANNER] Loading promotions for restaurant: ${restaurantId}`);

        const now = new Date().toISOString();

        // Query active promotions for this specific restaurant
        const { data, error: queryError } = await supabase
          .from('promotional_images')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .order('position', { ascending: true });

        if (queryError) {
          throw queryError;
        }

        if (data && data.length > 0) {
          // Convert promotional images to banner format
          const banners: BannerImage[] = data.map((promo: PromotionalImage) => ({
            src: promo.image_url,
            alt: promo.title || 'Promotional banner',
            title: promo.title || undefined,
            subtitle: promo.description || undefined,
          }));
          console.log(`[PROMO BANNER] Loaded ${banners.length} promotions`);
          setBannerImages(banners);
          setError(null);
        } else {
          // No promotional images - show empty carousel or hide it
          console.log('[PROMO BANNER] No active promotional images found');
          setBannerImages([]);
          setError(null);
        }
      } catch (err) {
        console.error('[PROMO BANNER] Error loading promotional images:', err);
        setBannerImages([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadBannerImages();
  }, [restaurantId]);

  if (loading) {
    return (
      <section className="w-full">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  // Don't show error state - just hide the banner if there are no images
  if (error || bannerImages.length === 0) {
    return null; // Hide banner when no promotional images
  }

  return (
    <section className="w-full">
      <BannerCarousel
        images={bannerImages}
        autoPlay={true}
        autoPlayInterval={5000}
      />
    </section>
  );
}
