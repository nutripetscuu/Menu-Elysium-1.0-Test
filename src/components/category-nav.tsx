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
  // Offset matches the `scroll-mt-32` on the section elements (8rem = 128px)
  const activeId = useScrollSpy(categoryIds, { offset: 130 });

  return (
    <nav className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <CarouselContent>
            {categories.map((category) => {
              return (
                <CarouselItem
                  key={category.id}
                  className="basis-auto"
                >
                  <Link href={`#${category.id}`} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "shrink-0 px-4 py-2 text-base font-medium transition-colors",
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
