"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuCategoryWithItems } from "@/lib/types/database";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CategoryNavProps {
  categories: MenuCategoryWithItems[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryNav({ categories, activeCategory, onCategoryChange }: CategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Function to scroll active item into view
  const scrollToActiveItem = (categoryId: string) => {
    const button = buttonRefs.current[categoryId];
    const carousel = scrollContainerRef.current;

    if (button && carousel) {
      // Find the carousel content container
      const carouselContent = carousel.querySelector('[data-carousel-content]') ||
                              carousel.querySelector('.carousel-content') ||
                              carousel.querySelector('[role="region"]');

      if (carouselContent) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = carouselContent.getBoundingClientRect();

        // Calculate if button is visible in container
        const isVisible =
          buttonRect.left >= containerRect.left &&
          buttonRect.right <= containerRect.right;

        if (!isVisible) {
          // Calculate scroll position to center the button
          const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
          const containerCenter = carouselContent.scrollWidth / 2;
          const scrollPosition = buttonCenter - containerCenter;

          carouselContent.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Update indicator position with smooth animation
  const updateIndicator = (categoryId: string) => {
    const button = buttonRefs.current[categoryId];

    if (button) {
      // Since the indicator is now inside the CarouselContent, we don't need to account for scroll offset
      setIndicatorStyle({
        left: button.offsetLeft,
        width: button.offsetWidth
      });
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    scrollToActiveItem(categoryId);
  };

  // Update indicator when active category changes
  useEffect(() => {
    if (activeCategory) {
      updateIndicator(activeCategory);
      scrollToActiveItem(activeCategory);
    } else {
      // No active category - hide indicator
      setIndicatorStyle({ left: 0, width: 0 });
    }
  }, [activeCategory]);

  // No need for scroll handler since indicator moves with the content now

  return (
    <nav className="sticky top-14 z-40 border-b bg-background/95 py-2 backdrop-blur">
      <div className="w-full px-2 relative">
        <Carousel
          ref={scrollContainerRef}
          opts={{
            align: "start",
            dragFree: true,
            skipSnaps: true,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1 relative">
            {/* Animated indicator - moved inside CarouselContent */}
            <div
              className="absolute top-0 h-full bg-restaurant-deep-burgundy rounded-full transition-all duration-300 ease-out z-0"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                transform: 'translateZ(0)' // Force hardware acceleration
              }}
            />
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <CarouselItem
                  key={category.id}
                  className="basis-auto pl-1"
                >
                  <Button
                    ref={(el) => {
                      buttonRefs.current[category.id] = el;
                    }}
                    variant="ghost"
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "shrink-0 rounded-full px-5 py-2 text-lg font-script transition-colors duration-300 cursor-pointer min-h-[44px] touch-manipulation relative z-10",
                      isActive
                        ? "text-white"
                        : "text-restaurant-charcoal-black hover:bg-restaurant-warm-beige"
                    )}
                    aria-current={isActive ? "page" : "false"}
                    aria-label={`Navigate to ${category.name} section`}
                  >
                    {category.name}
                  </Button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </nav>
  );
}
