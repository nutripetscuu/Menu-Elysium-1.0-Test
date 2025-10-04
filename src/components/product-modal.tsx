"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types/database";
import { useCart, type CartItem } from "@/contexts/cart-context";
import { getModifierGroups } from "@/lib/modifiers-data";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ item, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<"medium" | "grande">("medium");
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  // Get modifier groups for this item
  const modifierGroups = item ? getModifierGroups(item.modifierGroups || []) : [];

  // Initialize modifiers with default values when item changes
  useEffect(() => {
    if (!item) return;

    const groups = getModifierGroups(item.modifierGroups || []);
    const initialModifiers: Record<string, string[]> = {};

    groups.forEach(group => {
      const defaultOptions = group.options.filter(opt => opt.isDefault).map(opt => opt.id);
      if (defaultOptions.length > 0) {
        initialModifiers[group.id] = defaultOptions;
      } else if (group.required && group.options.length > 0) {
        initialModifiers[group.id] = [group.options[0].id];
      }
    });

    setSelectedModifiers(initialModifiers);
    setSelectedSize("medium");
    setQuantity(1);
  }, [item?.id]); // Only depend on item.id to prevent infinite loops

  if (!item) return null;

  const handleModifierChange = (groupId: string, optionId: string, groupType: string) => {
    setSelectedModifiers(prev => {
      const newModifiers = { ...prev };
      const currentSelections = prev[groupId] || [];

      if (groupType === 'boolean') {
        // Boolean type - toggle on/off
        if (currentSelections.includes(optionId)) {
          newModifiers[groupId] = [];
        } else {
          newModifiers[groupId] = [optionId];
        }
      } else if (groupType === 'single') {
        // Single selection - toggle or replace
        if (currentSelections.includes(optionId)) {
          // If clicking the same option, deselect it (only if not required)
          newModifiers[groupId] = [];
        } else {
          // Select new option
          newModifiers[groupId] = [optionId];
        }
      } else if (groupType === 'multiple') {
        // Multiple selection - toggle
        if (currentSelections.includes(optionId)) {
          newModifiers[groupId] = currentSelections.filter(id => id !== optionId);
        } else {
          newModifiers[groupId] = [...currentSelections, optionId];
        }
      }

      return newModifiers;
    });
  };

  const calculateTotal = () => {
    let basePrice = 0;

    // Get base price based on size or regular price
    if (item.sizes) {
      basePrice = parseFloat(item.sizes[selectedSize]);
    } else if (typeof item.price === "string") {
      basePrice = parseFloat(item.price);
    } else {
      basePrice = item.price;
    }

    // Add modifier prices
    modifierGroups.forEach(group => {
      const selectedOptions = selectedModifiers[group.id] || [];
      selectedOptions.forEach(optionId => {
        const option = group.options.find(opt => opt.id === optionId);
        if (option) {
          basePrice += option.priceModifier;
        }
      });
    });

    return basePrice * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    const unitPrice = calculateTotal() / quantity;

    // Build selected modifiers info for cart display
    const modifiersInfo = modifierGroups.map(group => {
      const selectedOptions = selectedModifiers[group.id] || [];
      return {
        groupId: group.id,
        groupName: group.name,
        selectedOptions: selectedOptions.map(optionId => {
          const option = group.options.find(opt => opt.id === optionId);
          return option ? {
            optionId: option.id,
            optionLabel: option.label,
            priceModifier: option.priceModifier
          } : null;
        }).filter(Boolean)
      };
    }).filter(mod => mod.selectedOptions.length > 0);

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}-${Math.random()}`, // Unique ID
      menuItem: item,
      selectedSize: item.sizes ? selectedSize : undefined,
      selectedModifiers: modifiersInfo as any,
      quantity,
      unitPrice,
      totalPrice: calculateTotal(),
    };

    addItem(cartItem);
    onClose();

    // Reset form
    setSelectedSize("medium");
    setSelectedModifiers({});
    setQuantity(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-restaurant-charcoal-black">
            {item.name}
          </DialogTitle>
          <p className="text-sm text-restaurant-warm-gray mt-2">
            {item.description}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-restaurant-muted-coral/10 text-restaurant-deep-burgundy border-restaurant-muted-coral/20">
                  {tag === "Popular" ? "Nuevo" : tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Size Selection (if item has sizes) */}
          {item.sizes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-restaurant-charcoal-black">Tamaño</h3>
              <RadioGroup value={selectedSize} onValueChange={(value) => setSelectedSize(value as "medium" | "grande")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="flex-1 cursor-pointer">
                    <div className="flex justify-between">
                      <span>Mediano</span>
                      <span className="font-bold text-restaurant-deep-burgundy">${item.sizes.medium}</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grande" id="grande" />
                  <Label htmlFor="grande" className="flex-1 cursor-pointer">
                    <div className="flex justify-between">
                      <span>Grande</span>
                      <span className="font-bold text-restaurant-deep-burgundy">${item.sizes.grande}</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Dynamic Modifier Groups */}
          {modifierGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <h3 className="font-semibold text-restaurant-charcoal-black">
                {group.name}
                {group.required && <span className="text-red-500 ml-1">*</span>}
              </h3>

              {group.type === 'single' ? (
                <RadioGroup
                  value={selectedModifiers[group.id]?.[0] || ''}
                  onValueChange={(value) => handleModifierChange(group.id, value, group.type)}
                >
                  {group.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{option.label}</span>
                          {option.priceModifier > 0 && (
                            <span className="text-restaurant-deep-burgundy">+${option.priceModifier}</span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {group.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedModifiers[group.id]?.includes(option.id) || false}
                        onCheckedChange={() => handleModifierChange(group.id, option.id, group.type)}
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{option.label}</span>
                          {option.priceModifier > 0 && (
                            <span className="text-restaurant-deep-burgundy">+${option.priceModifier}</span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-restaurant-charcoal-black">Cantidad</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total and Add to Cart */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-restaurant-charcoal-black">Total:</span>
              <span className="text-2xl font-bold text-restaurant-deep-burgundy">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-restaurant-deep-burgundy hover:bg-restaurant-deep-burgundy/90 text-white"
              size="lg"
            >
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}