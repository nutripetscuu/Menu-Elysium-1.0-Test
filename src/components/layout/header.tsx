"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, CalendarDays, ShoppingBag, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { MenuCategoryWithItems } from "@/lib/types/database";
import { iconMap, type IconName } from "@/components/icon-map";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  categories: MenuCategoryWithItems[];
}

export function Header({ categories }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Mobile menu */}
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5 text-restaurant-charcoal-black" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col h-full">
              <SheetHeader className="flex-shrink-0">
                <SheetTitle>
                  <Link href="/" className="flex items-center justify-center">
                    <Image
                      src="/images/elysium-logo.svg"
                      alt="Elysium Café"
                      width={120}
                      height={60}
                      className="object-contain"
                    />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <nav className="mt-8 flex flex-col gap-4">
                  {categories.map((category) => {
                    const Icon = iconMap[category.icon as IconName] || iconMap['UtensilsCrossed'];
                    return (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="justify-start gap-3 text-lg font-script"
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
                <Separator className="my-4" />
                <div className="flex flex-col gap-4 pb-6">
                   <Button variant="ghost" className="justify-start gap-3 text-lg" disabled>
                          <CalendarDays className="h-5 w-5 text-primary" />
                          Reservar
                   </Button>
                   <Button variant="ghost" className="justify-start gap-3 text-lg" disabled>
                          <ShoppingBag className="h-5 w-5 text-primary" />
                          Ordenar en Línea
                   </Button>
                   <Button variant="ghost" className="justify-start gap-3 text-lg" disabled>
                          <Utensils className="h-5 w-5 text-primary" />
                          Uber Eats
                   </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile-first logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <Image
            src="/images/elysium-logo.svg"
            alt="Elysium Café"
            width={100}
            height={40}
            className="object-contain"
          />
        </Link>
        
        {/* Mobile spacer */}
        <div className="w-10" />

      </div>
    </header>
  );
}
