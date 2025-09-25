"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { CartModal } from "@/components/cart-modal";

interface CartIconProps {
  onClick?: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { totalItems, totalPrice } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (totalItems === 0) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10"
        onClick={handleClick}
      >
        <ShoppingCart className="h-5 w-5 text-restaurant-charcoal-black" />

        {/* Item count badge */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-restaurant-deep-burgundy text-xs font-semibold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>

        {/* Total price indicator */}
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-restaurant-deep-burgundy whitespace-nowrap">
          ${totalPrice.toFixed(2)}
        </span>

        <span className="sr-only">
          Carrito: {totalItems} {totalItems === 1 ? "artículo" : "artículos"}, ${totalPrice.toFixed(2)}
        </span>
      </Button>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}