"use client";

import { useEffect, useState } from "react";
import { BannerCarousel } from "./banner-carousel";
import { LoadingSpinner } from "./ui/loading-spinner";
import { HeaderImagesAPI, type BannerImage } from "@/lib/api/header-images";

export function PromoBanner() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBannerImages = async () => {
      try {
        setLoading(true);
        const response = await HeaderImagesAPI.getBannerImages();

        if (response.success && response.data && response.data.length > 0) {
          setBannerImages(response.data);
          setError(null);
        } else {
          // Fallback to static images if database fails
          console.warn('Using fallback images:', response.error);
          setBannerImages(HeaderImagesAPI.getFallbackImages());
          setError(null);
        }
      } catch (err) {
        console.error('Error loading banner images:', err);
        // Use fallback images on error
        setBannerImages(HeaderImagesAPI.getFallbackImages());
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadBannerImages();
  }, []);

  if (loading) {
    return (
      <section className="w-full">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <p className="mb-2">Error loading banner images</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
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
