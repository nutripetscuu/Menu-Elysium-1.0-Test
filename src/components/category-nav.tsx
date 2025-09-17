"use client";

import Link from "next/link";
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
}

export function CategoryNav({ categories, activeCategory }: CategoryNavProps) {

  return (
    <nav className="sticky top-14 z-40 border-b bg-background/95 py-2 backdrop-blur">
      <div className="w-full px-2">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
            skipSnaps: true,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <CarouselItem
                  key={category.id}
                  className="basis-auto pl-1"
                >
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "shrink-0 rounded-full px-5 py-2 text-lg font-script transition-colors cursor-pointer text-restaurant-charcoal-black hover:bg-restaurant-warm-beige min-h-[44px] touch-manipulation",
                      isActive &&
                        "bg-restaurant-deep-burgundy text-white hover:bg-restaurant-deep-burgundy/90 hover:text-white shadow-sm"
                    )}
                    aria-current={isActive ? "page" : "false"}
                    aria-label={`Navigate to ${category.name} section`}
                  >
                    <Link href={`/menu/${category.id}`}>
                      {category.name}
                    </Link>
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
