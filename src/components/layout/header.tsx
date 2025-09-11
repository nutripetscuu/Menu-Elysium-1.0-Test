"use client";

import Link from "next/link";
import { Menu, Phone, MapPin } from "lucide-react";
import { usePathname } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MenuCategory } from "@/lib/menu-data";
import { iconMap } from "@/components/icon-map";

interface HeaderProps {
  categories: MenuCategory[];
}

export function Header({ categories }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/menu/appetizers" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-primary">
                      Kampai
                    </span>
                    <span className="text-xl font-medium">Menú</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon];
                  const isActive = pathname === `/menu/${category.id}`;
                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? "default" : "ghost"}
                      className="justify-start gap-3 text-lg"
                      asChild
                    >
                      <Link href={`/menu/${category.id}`}>
                        <Icon className="h-5 w-5 text-primary" />
                        {category.name}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/menu/appetizers" className="flex items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
          <span className="text-xl font-bold tracking-tight text-primary">
            Kampai
          </span>
          <span className="text-xl font-medium">Menú</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span>(123) 456-7890</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>123 Calle Culinaria, Ciudad Foodie</span>
          </div>
        </div>
      </div>
    </header>
  );
}
