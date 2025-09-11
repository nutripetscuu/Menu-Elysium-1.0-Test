"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/app/page";
import { iconMap } from "./icon-map";

interface CategoryNavProps {
  categories: MenuCategory[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const categoryIds = categories.map((c) => c.id);
  // Offset matches the `scroll-mt-32` on the section elements (8rem = 128px)
  const activeId = useScrollSpy(categoryIds, { offset: 130 }); 

  return (
    <nav className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {categories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <Link key={category.id} href={`#${category.id}`} passHref>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "shrink-0 gap-2 transition-colors",
                    activeId === category.id && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                  aria-current={activeId === category.id ? "true" : "false"}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
