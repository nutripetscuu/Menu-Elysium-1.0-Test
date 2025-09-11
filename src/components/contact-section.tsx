import { CalendarDays, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactSection() {
  return (
    <footer className="border-t bg-card/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-bold tracking-tight text-primary">Kampai</h3>
            <p className="mt-2 text-muted-foreground">Modern Japanese Cuisine</p>
          </div>
          
          <div className="text-muted-foreground">
            <h4 className="font-semibold text-foreground">Visit Us</h4>
            <p className="mt-2">123 Culinary Lane, Foodie City, 90210</p>
            <p>Mon-Sat: 5pm - 11pm</p>
            <p>Sun: 5pm - 10pm</p>
          </div>

          <div className="flex flex-col items-center gap-4 md:items-end">
             <h4 className="font-semibold text-foreground md:self-center">Reservations & Online Orders</h4>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row md:w-full">
              <Button variant="outline" className="w-full justify-center gap-2" size="lg">
                <CalendarDays />
                RSVP
              </Button>
              <Button variant="outline" className="w-full justify-center gap-2" size="lg">
                <ShoppingBag />
                Order Online
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kampai Menu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
