"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, CalendarDays, ShoppingBag, Utensils, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart-icon";
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
  onShowAll?: () => void;
}

export function Header({ categories, onShowAll }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="flex h-14 items-center px-4 relative">
        {/* Back to NoWaiter button */}
        <div className="flex-shrink-0 mr-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-[#0B2C4D] hover:bg-[#0B2C4D]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to NoWaiter</span>
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="flex-shrink-0">
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

        {/* Centered logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <button
            onClick={onShowAll}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/elysium-logo.svg"
              alt="Elysium Café"
              width={100}
              height={40}
              className="object-contain"
            />
          </button>
        </div>

        {/* Cart Icon (right side) */}
        <div className="flex-shrink-0 ml-auto">
          <CartIcon />
        </div>

      </div>
    </header>
  );
}