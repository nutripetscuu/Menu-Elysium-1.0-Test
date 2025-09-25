"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Hash } from "lucide-react";

interface TableNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tableNumber: string) => void;
  isSubmitting: boolean;
}

export function TableNumberModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}: TableNumberModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate table number
    const trimmedNumber = tableNumber.trim();

    if (!trimmedNumber) {
      setError("Por favor ingresa el número de mesa");
      return;
    }

    // Check if it's a valid number (allow letters too for tables like "A1", "VIP1", etc.)
    if (trimmedNumber.length > 10) {
      setError("El número de mesa es demasiado largo");
      return;
    }

    setError("");
    onConfirm(trimmedNumber);
  };

  const handleClose = () => {
    setTableNumber("");
    setError("");
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow alphanumeric characters and some special characters for table identifiers
    if (/^[a-zA-Z0-9\-_]*$/.test(value) || value === "") {
      setTableNumber(value);
      if (error) setError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-restaurant-charcoal-black flex items-center gap-2">
            <Hash className="h-5 w-5 text-restaurant-deep-burgundy" />
            Número de Mesa
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tableNumber" className="text-restaurant-charcoal-black">
              ¿En qué mesa te encuentras?
            </Label>
            <Input
              id="tableNumber"
              type="text"
              value={tableNumber}
              onChange={handleInputChange}
              placeholder=""
              className={`text-center text-lg font-semibold ${
                error
                  ? "border-red-500 focus:border-red-500"
                  : "border-restaurant-warm-beige focus:border-restaurant-deep-burgundy"
              }`}
              disabled={isSubmitting}
              autoFocus
              maxLength={10}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="text-sm text-restaurant-warm-gray text-center">
            El número de mesa se encuentra en tu mesa
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !tableNumber.trim()}
              className="flex-1 bg-restaurant-deep-burgundy hover:bg-restaurant-deep-burgundy/90 text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Confirmar Pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}