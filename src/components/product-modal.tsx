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
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null); // For new variants system
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  // Get modifier groups for this item
  // Handle both string[] (legacy) and ModifierGroup[] (new) formats
  const modifierGroups = item ? (
    Array.isArray(item.modifierGroups) && item.modifierGroups.length > 0
      ? typeof item.modifierGroups[0] === 'string'
        ? getModifierGroups(item.modifierGroups as string[]) // Legacy format: array of IDs
        : (item.modifierGroups as any[]) // New format: array of full ModifierGroup objects
      : []
  ) : [];

  // Initialize modifiers with default values when item changes
  useEffect(() => {
    if (!item) return;

    const initialModifiers: Record<string, string[]> = {};

    modifierGroups.forEach((group: any) => {
      const defaultOptions = group.options.filter((opt: any) => opt.isDefault).map((opt: any) => opt.id);
      if (defaultOptions.length > 0) {
        initialModifiers[group.id] = defaultOptions;
      } else if (group.required && group.options.length > 0) {
        initialModifiers[group.id] = [group.options[0].id];
      }
    });

    setSelectedModifiers(initialModifiers);
    setSelectedSize("medium");
    // Initialize first variant if variants exist
    if (item.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0].id);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
  }, [item]); // Only depend on item, not modifierGroups (which is derived from item)

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

    // Get base price based on pricing type (priority: variants > sizes > price)
    if (item.variants && item.variants.length > 0 && selectedVariant) {
      // New variants system
      const variant = item.variants.find(v => v.id === selectedVariant);
      basePrice = variant ? variant.price : 0;
    } else if (item.sizes) {
      // Legacy M/G sizes
      basePrice = parseFloat(item.sizes[selectedSize]);
    } else if (typeof item.price === "string") {
      // Single price as string
      basePrice = parseFloat(item.price);
    } else if (typeof item.price === "number") {
      // Single price as number
      basePrice = item.price;
    }

    // Add modifier prices
    modifierGroups.forEach((group: any) => {
      const selectedOptions = selectedModifiers[group.id] || [];
      selectedOptions.forEach((optionId: string) => {
        const option = group.options.find((opt: any) => opt.id === optionId);
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
    const modifiersInfo = modifierGroups.map((group: any) => {
      const selectedOptions = selectedModifiers[group.id] || [];
      return {
        groupId: group.id,
        groupName: group.name,
        selectedOptions: selectedOptions.map((optionId: string) => {
          const option = group.options.find((opt: any) => opt.id === optionId);
          return option ? {
            optionId: option.id,
            optionLabel: option.label,
            priceModifier: option.priceModifier
          } : null;
        }).filter(Boolean)
      };
    }).filter((mod: any) => mod.selectedOptions.length > 0);

    // Get selected variant info for cart display
    const variantInfo = item.variants && item.variants.length > 0 && selectedVariant
      ? item.variants.find(v => v.id === selectedVariant)
      : undefined;

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}-${Math.random()}`, // Unique ID
      menuItem: item,
      selectedSize: item.sizes && !item.variants?.length ? selectedSize : undefined,
      selectedVariant: variantInfo ? {
        id: variantInfo.id,
        name: variantInfo.name,
        price: variantInfo.price
      } : undefined,
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

          {/* Variant Selection (new unlimited variants system) */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-restaurant-charcoal-black">Tamaño</h3>
              <RadioGroup value={selectedVariant || ''} onValueChange={(value) => setSelectedVariant(value)}>
                {item.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant.id} id={variant.id} />
                    <Label htmlFor={variant.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{variant.name}</span>
                        <span className="font-bold text-restaurant-deep-burgundy">${variant.price.toFixed(2)}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Size Selection (legacy M/G sizes) */}
          {!item.variants?.length && item.sizes && (
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
                  {group.options.map((option: any) => (
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
                  {group.options.map((option: any) => (
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