"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types/database";
import { useCart, type CartItem } from "@/contexts/cart-context";

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// Product options data
const MILK_OPTIONS = [
  { id: "regular", name: "Leche Regular", price: 0 },
  { id: "almond", name: "Leche de Almendra", price: 3 },
  { id: "oat", name: "Leche de Avena", price: 3 },
  { id: "lactose-free", name: "Leche Deslactosada", price: 2 },
  { id: "soy", name: "Leche de Soja", price: 2 },
];

const SUGAR_OPTIONS = [
  { id: "normal", name: "Azúcar Normal", price: 0 },
  { id: "stevia", name: "Stevia", price: 1 },
  { id: "no-sugar", name: "Sin Azúcar", price: 0 },
];

const EXTRA_OPTIONS = [
  { id: "extra-shot", name: "Shot Extra de Café", price: 5 },
  { id: "whipped-cream", name: "Crema Batida", price: 4 },
  { id: "vanilla-syrup", name: "Jarabe de Vainilla", price: 3 },
  { id: "caramel-syrup", name: "Jarabe de Caramelo", price: 3 },
];

export function ProductModal({ item, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<"medium" | "grande">("medium");
  const [selectedMilk, setSelectedMilk] = useState("regular");
  const [selectedSugar, setSelectedSugar] = useState("normal");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [extras, setExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Function to extract flavors from description
  const extractFlavors = (description: string): string[] => {
    const flavorPatterns = [
      /Selección de tés?:\s*([^.]+)/i,
      /Sabores?:\s*([^.]+)/i,
      /Opciones?:\s*([^.]+)/i,
      /Variedades?:\s*([^.]+)/i,
    ];

    for (const pattern of flavorPatterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1]
          .split(/[,y]/)
          .map(flavor => flavor.trim())
          .filter(flavor => flavor.length > 0);
      }
    }
    return [];
  };

  // Extract flavors and check if item has flavors - do this before useEffect
  const availableFlavors = item ? extractFlavors(item.description || "") : [];
  const hasFlavors = availableFlavors.length > 0;

  // Set initial flavor if available - always call useEffect at the top level
  useEffect(() => {
    if (item && hasFlavors && !selectedFlavor && availableFlavors.length > 0) {
      setSelectedFlavor(availableFlavors[0]);
    }
  }, [item, hasFlavors, availableFlavors, selectedFlavor]);

  if (!item) return null;

  const toggleExtra = (extraId: string) => {
    setExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
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

    // Add milk option price
    const milkOption = MILK_OPTIONS.find(option => option.id === selectedMilk);
    if (milkOption) {
      basePrice += milkOption.price;
    }

    // Add sugar option price
    const sugarOption = SUGAR_OPTIONS.find(option => option.id === selectedSugar);
    if (sugarOption) {
      basePrice += sugarOption.price;
    }

    // Add extras prices
    extras.forEach(extraId => {
      const extra = EXTRA_OPTIONS.find(option => option.id === extraId);
      if (extra) {
        basePrice += extra.price;
      }
    });

    return basePrice * quantity;
  };

  const handleAddToCart = () => {
    if (!item) return;

    const unitPrice = calculateTotal() / quantity;
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}-${Math.random()}`, // Unique ID
      menuItem: item,
      selectedSize: item.sizes ? selectedSize : undefined,
      selectedMilk: selectedMilk !== "regular" ? selectedMilk : undefined,
      selectedSugar: selectedSugar !== "normal" ? selectedSugar : undefined,
      selectedFlavor: hasFlavors ? selectedFlavor : undefined,
      extras,
      quantity,
      unitPrice,
      totalPrice: calculateTotal(),
    };

    addItem(cartItem);
    onClose();

    // Reset form
    setSelectedSize("medium");
    setSelectedMilk("regular");
    setSelectedSugar("normal");
    setSelectedFlavor("");
    setExtras([]);
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

          {/* Flavor Selection (for items with multiple flavors) */}
          {hasFlavors && (
            <div className="space-y-3">
              <h3 className="font-semibold text-restaurant-charcoal-black">Sabor</h3>
              <RadioGroup value={selectedFlavor} onValueChange={setSelectedFlavor}>
                {availableFlavors.map((flavor) => (
                  <div key={flavor} className="flex items-center space-x-2">
                    <RadioGroupItem value={flavor} id={flavor} />
                    <Label htmlFor={flavor} className="flex-1 cursor-pointer">
                      <span>{flavor}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Milk Options (for coffee items) */}
          {(item.name.toLowerCase().includes('café') || item.name.toLowerCase().includes('latte') || item.name.toLowerCase().includes('cappuccino') || item.name.toLowerCase().includes('espresso')) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-restaurant-charcoal-black">Tipo de Leche</h3>
              <RadioGroup value={selectedMilk} onValueChange={setSelectedMilk}>
                {MILK_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-restaurant-deep-burgundy">+${option.price}</span>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Sugar Options (for coffee items) */}
          {(item.name.toLowerCase().includes('café') || item.name.toLowerCase().includes('latte') || item.name.toLowerCase().includes('cappuccino') || item.name.toLowerCase().includes('espresso')) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-restaurant-charcoal-black">Endulzante</h3>
              <RadioGroup value={selectedSugar} onValueChange={setSelectedSugar}>
                {SUGAR_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-restaurant-deep-burgundy">+${option.price}</span>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Extra Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-restaurant-charcoal-black">Extras (Opcional)</h3>
            <div className="space-y-2">
              {EXTRA_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={extras.includes(option.id)}
                    onChange={() => toggleExtra(option.id)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between">
                      <span>{option.name}</span>
                      <span className="text-restaurant-deep-burgundy">+${option.price}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

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