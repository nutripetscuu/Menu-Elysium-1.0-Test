"use client";

import Link from "next/link";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/app/page";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CategoryNavProps {
  categories: MenuCategory[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const categoryIds = categories.map((c) => c.id);
  // Offset matches the `scroll-mt-24` on the section elements
  const activeId = useScrollSpy(categoryIds, { offset: 98 });

  return (
    <nav className="sticky top-[65px] z-30 border-b bg-background/95 py-2 backdrop-blur">
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
          <CarouselContent className="-ml-2">
            {categories.map((category, index) => {
              return (
                <CarouselItem
                  key={category.id}
                  className="basis-auto pl-2"
                >
                  <Link href={`#${category.id}`} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "shrink-0 rounded-full px-4 py-1 text-base font-medium transition-colors",
                        activeId === category.id &&
                          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      )}
                      aria-current={activeId === category.id ? "true" : "false"}
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
