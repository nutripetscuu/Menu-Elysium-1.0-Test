import { CalendarDays, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <footer className="border-t bg-card/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-bold tracking-tight text-primary">Kampai</h3>
            <p className="mt-2 text-muted-foreground">Cocina Japonesa Moderna</p>
          </div>
          
          <div className="text-muted-foreground">
            <h4 className="font-semibold text-foreground">Visítanos</h4>
            <p className="mt-2">123 Calle Culinaria, Ciudad Foodie, 90210</p>
            <p>Lun-Sáb: 5pm - 11pm</p>
            <p>Dom: 5pm - 10pm</p>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
             <h4 className="font-semibold text-foreground md:self-center">Reservas y Pedidos en Línea</h4>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row md:w-full">
              <Button variant="outline" className="w-full justify-center gap-2" size="lg">
                <CalendarDays />
                Reservar
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2" size="lg">
                <ShoppingBag />
                Pedir en Línea
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Menú Kampai. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
