"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, Send } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Separator } from "@/components/ui/separator";
import { telegramService } from "@/lib/services/telegram";
import { useToast } from "@/hooks/use-toast";
import { TableNumberModal } from "@/components/table-number-modal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Option display names
const MILK_NAMES: { [key: string]: string } = {
  regular: "Leche Regular",
  almond: "Leche de Almendra",
  oat: "Leche de Avena",
  "lactose-free": "Leche Deslactosada",
  soy: "Leche de Soja",
};

const SUGAR_NAMES: { [key: string]: string } = {
  normal: "Azúcar Normal",
  stevia: "Stevia",
  "no-sugar": "Sin Azúcar",
};

const EXTRA_NAMES: { [key: string]: string } = {
  "extra-shot": "Shot Extra de Café",
  "whipped-cream": "Crema Batida",
  "vanilla-syrup": "Jarabe de Vainilla",
  "caramel-syrup": "Jarabe de Caramelo",
};

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const { toast } = useToast();

  const handleSubmitOrder = async (tableNumber: string) => {
    setIsSubmitting(true);

    try {
      const orderData = {
        items,
        totalPrice,
        totalItems,
        timestamp: new Date().toISOString(),
        tableNumber,
      };

      const result = await telegramService.sendOrder(orderData);

      if (result.success) {
        toast({
          title: "¡Pedido enviado exitosamente!",
          description: `Tu pedido ha sido enviado al restaurante para la mesa #${tableNumber}. Te contactaremos pronto.`,
        });
        clearCart();
        setShowTableModal(false);
        onClose();
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error al enviar el pedido",
        description: "Hubo un problema al enviar tu pedido. Por favor, inténtalo de nuevo o contacta al restaurante directamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderClick = () => {
    setShowTableModal(true);
  };

  if (totalItems === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-restaurant-charcoal-black">
              Tu Carrito
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-restaurant-warm-gray mb-4">Tu carrito está vacío</p>
            <Button onClick={onClose} variant="outline">
              Continuar Comprando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-restaurant-charcoal-black">
            Tu Carrito ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-restaurant-warm-beige/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-restaurant-charcoal-black">
                    {item.menuItem.name}
                  </h3>

                  {/* Options */}
                  <div className="mt-1 space-y-1 text-sm text-restaurant-warm-gray">
                    {item.selectedVariant && (
                      <p>Tamaño: {item.selectedVariant.name}</p>
                    )}
                    {item.selectedSize && !item.selectedVariant && (
                      <p>Tamaño: {item.selectedSize === "medium" ? "Mediano" : "Grande"}</p>
                    )}
                    {item.selectedMilk && (
                      <p>Leche: {MILK_NAMES[item.selectedMilk] || item.selectedMilk}</p>
                    )}
                    {item.selectedSugar && (
                      <p>Endulzante: {SUGAR_NAMES[item.selectedSugar] || item.selectedSugar}</p>
                    )}
                    {item.selectedFlavor && (
                      <p>Sabor: {item.selectedFlavor}</p>
                    )}
                    {item.extras && item.extras.length > 0 && (
                      <p>Extras: {item.extras.map(extra => EXTRA_NAMES[extra] || extra).join(", ")}</p>
                    )}
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="mt-2">
                        {item.selectedModifiers.map((modifier) => (
                          <p key={modifier.groupId}>
                            {modifier.groupName}: {modifier.selectedOptions.map(opt => opt.optionLabel).join(", ")}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-right">
                  <p className="text-sm text-restaurant-warm-gray">
                    ${item.unitPrice.toFixed(2)} c/u
                  </p>
                  <p className="font-bold text-restaurant-deep-burgundy">
                    ${item.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-restaurant-charcoal-black">Total:</span>
              <span className="text-2xl font-bold text-restaurant-deep-burgundy">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={handleOrderClick}
              disabled={isSubmitting}
              className="w-full bg-restaurant-deep-burgundy hover:bg-restaurant-deep-burgundy/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Pedir a mi mesa
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Table Number Modal */}
      <TableNumberModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onConfirm={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
}