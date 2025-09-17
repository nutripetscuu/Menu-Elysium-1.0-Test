import { CalendarDays, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <footer className="border-t border-restaurant-warm-beige bg-restaurant-warm-beige/20 mt-12">
      <div className="px-4 py-8">
        {/* Mobile-first single column layout */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-restaurant-charcoal-black">ELYSIUM CAFÉ</h3>
            <p className="mt-1 text-restaurant-deep-burgundy font-medium italic">Cafetería</p>
            <p className="mt-2 text-sm text-restaurant-warm-gray">UN LUGAR EN DONDE TODO SABE</p>
          </div>

          <div className="text-restaurant-warm-gray">
            <h4 className="font-semibold text-restaurant-charcoal-black mb-3">Visítanos</h4>
            <div className="space-y-1 text-sm">
              <p>Chihuahua, Plaza Campus City</p>
              <p>614 729 8827</p>
              <p>Mar-Vie: 3:30-9:30 PM</p>
              <p>Sáb: 3:30-9:30 PM</p>
              <p>Dom: 4:30-9 PM</p>
              <p>Lun: Cerrado</p>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <h4 className="font-semibold text-restaurant-charcoal-black mb-4">Reservas y Pedidos</h4>
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-center gap-2 border-restaurant-deep-burgundy text-restaurant-deep-burgundy hover:bg-restaurant-deep-burgundy hover:text-white" 
                size="lg"
                disabled
              >
                <CalendarDays className="h-4 w-4" />
                Reservar Mesa
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-center gap-2 border-restaurant-muted-coral text-restaurant-muted-coral hover:bg-restaurant-muted-coral hover:text-white" 
                size="lg"
                disabled
              >
                <ShoppingBag className="h-4 w-4" />
                Pedir en Línea
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-restaurant-warm-beige text-center">
          <p className="text-xs text-restaurant-warm-gray">
            &copy; {new Date().getFullYear()} Menú ELYSIUM. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
