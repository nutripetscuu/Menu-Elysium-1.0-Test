"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface BannerImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface BannerCarouselProps {
  images: BannerImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function BannerCarousel({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
}: BannerCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  // Auto-play functionality
  useEffect(() => {
    if (!api || !autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [api, autoPlay, autoPlayInterval, images.length]);

  if (images.length === 0) return null;

  return (
    <Carousel
      setApi={setApi}
      opts={{
        loop: true,
        align: "center",
      }}
      className="w-full relative"
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="relative">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              />

            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Static text overlay - positioned middle-left, stays over all images */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 z-10">
        <div className="text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-script mb-3 text-white drop-shadow-lg">
            Elysium Café
          </h2>
          <p className="text-lg md:text-xl font-script opacity-90 drop-shadow-md mb-3">
            Matcha • Frappés • Artesanal
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            <span className="text-sm md:text-base font-medium">
              ¡Prueba nuestro Matcha Premium!
            </span>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-white/60 transition-all duration-300"
            />
          ))}
        </div>
      )}
    </Carousel>
  );
}