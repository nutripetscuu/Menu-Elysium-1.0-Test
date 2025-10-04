"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { MenuItem } from "@/lib/types/database";

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedSize?: "medium" | "grande";
  selectedMilk?: string;
  selectedSugar?: string;
  selectedFlavor?: string;
  extras?: string[];
  selectedModifiers?: {
    groupId: string;
    groupName: string;
    selectedOptions: {
      optionId: string;
      optionLabel: string;
      priceModifier: number;
    }[];
  }[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const addItem = (newItem: CartItem) => {
    setItems(prevItems => {
      // Check if item with same options already exists
      const existingItemIndex = prevItems.findIndex(item =>
        item.menuItem.id === newItem.menuItem.id &&
        item.selectedSize === newItem.selectedSize &&
        JSON.stringify(item.selectedModifiers || []) === JSON.stringify(newItem.selectedModifiers || [])
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        existingItem.quantity += newItem.quantity;
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}