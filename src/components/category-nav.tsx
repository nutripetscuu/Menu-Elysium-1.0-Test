"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/lib/menu-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CategoryNavProps {
  categories: MenuCategory[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-[64px] z-30 border-b bg-background/95 py-3 backdrop-blur">
      <div className="container mx-auto max-w-full px-0">
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
              const isActive = pathname === `/menu/${category.id}`;
              return (
                <CarouselItem
                  key={category.id}
                  className="basis-auto pl-1"
                >
                  <Link href={`/menu/${category.id}`} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "shrink-0 rounded-full px-4 py-1 text-base font-medium transition-colors",
                        isActive &&
                          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      )}
                      aria-current={isActive ? "true" : "false"}
                    >
                      {category.name}
                    </Button>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </nav>
  );
}
