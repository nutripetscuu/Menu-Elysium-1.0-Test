import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Fish, Beef, GlassWater, UtensilsCrossed, Soup, Leaf } from "lucide-react";

import { Header } from "@/components/layout/header";
import { PromoBanner } from "@/components/promo-banner";
import { CategoryNav } from "@/components/category-nav";
import { ContactSection } from "@/components/contact-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconName, iconMap } from "@/components/icon-map";

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image?: {
    id: string;
    url: string;
    hint: string;
  };
  tags?: string[];
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: IconName;
  items: MenuItem[];
};

const menuData: MenuCategory[] = [
  {
    id: "appetizers",
    name: "Entradas",
    icon: "UtensilsCrossed",
    items: [
      {
        name: "Edamame",
        description: "Frijoles de soya tiernos al vapor con sal de mar.",
        price: "6",
        tags: ["V", "GF"],
      },
      {
        name: "Gyoza",
        description: "Empanaditas de cerdo y verduras fritas en sartén.",
        price: "9",
      },
      {
        name: "Agedashi Tofu",
        description: "Tofu ligeramente frito en un sabroso caldo dashi.",
        price: "8",
      },
      {
        name: "Ensalada de Algas",
        description: "Ensalada japonesa clásica con aderezo de sésamo.",
        price: "7",
        tags: ["V"],
      },
    ],
  },
  {
    id: "sushi-sashimi",
    name: "Sushi",
    icon: "Fish",
    items: [
      {
        name: "Maguro (Atún)",
        description: "3 piezas de atún aleta azul fresco de alta calidad.",
        price: "12",
      },
      {
        name: "Sake (Salmón)",
        description: "3 piezas de rico y graso salmón del Atlántico.",
        price: "9",
        tags: ["Popular"],
      },
      {
        name: "Hamachi (Jurel)",
        description: "3 piezas de delicado y suave jurel.",
        price: "11",
      },
      {
        name: "Rollo Dragón",
        description: "Anguila y pepino cubierto con aguacate y tobiko.",
        price: "16",
      },
    ],
  },
  {
    id: "ramen",
    name: "Ramen",
    icon: "Soup",
    items: [
      {
        name: "Tonkotsu Ramen",
        description:
          "Rico caldo de hueso de cerdo, cerdo chashu, huevo cocido suave y fideos.",
        price: "18",
        tags: ["Popular"],
      },
      {
        name: "Shoyu Ramen",
        description: "Caldo de pollo a base de salsa de soya, brotes de bambú y nori.",
        price: "16",
      },
      {
        name: "Miso Ramen",
        description: "Caldo de soya fermentada con maíz, mantequilla y germen de soya.",
        price: "17",
      },
      {
        name: "Ramen Vegano Yasai",
        description: "Caldo de verduras con vegetales de temporada, tofu y champiñones.",
        price: "17",
        tags: ["V"],
      },
    ],
  },
  {
    id: "grill",
    name: "De la Parrilla",
    icon: "Beef",
    items: [
      {
        name: "Bistec Wagyu",
        description: "Wagyu A5 de Kagoshima, servido con wasabi y sal de roca.",
        price: "55",
      },
      {
        name: "Bacalao Negro con Miso",
        description: "Marinado en miso dulce y asado a la perfección.",
        price: "28",
        tags: ["Popular"],
      },
      {
        name: "Pollo Teriyaki",
        description: "Muslo de pollo a la parrilla con un glaseado clásico de soya dulce.",
        price: "19",
      },
    ],
  },
  {
    id: "drinks",
    name: "Bebidas",
    icon: "GlassWater",
    items: [
      {
        name: "Asahi Super Dry",
        description: "Lager japonesa clásica.",
        price: "8",
      },
      {
        name: "Dassai 45 'Otter Fest'",
        description: "Sake Junmai Daiginjo premium, afrutado y limpio.",
        price: "18/copa",
      },
      {
        name: "Latte Matcha Helado",
        description: "Matcha de grado ceremonial con tu elección de leche.",
        price: "7",
        tags: ["SA"],
      },
    ],
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header categories={menuData} />
      <main className="flex-1">
        <PromoBanner />
        <CategoryNav categories={menuData} />

        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {menuData.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <section
                key={category.id}
                id={category.id}
                className="mb-16 scroll-mt-32"
                aria-labelledby={`${category.id}-heading`}
              >
                <h2 id={`${category.id}-heading`} className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-2">
                  {category.items.map((item) => (
                    <Card key={item.name} className="flex flex-col overflow-hidden bg-card/50 transition-shadow duration-300 hover:shadow-primary/20 hover:shadow-lg">
                      <div className="flex-grow">
                        <CardHeader className="flex flex-row items-start justify-between pb-4">
                          <CardTitle className="text-xl font-medium">
                            {item.name}
                          </CardTitle>
                          <p className="text-xl font-semibold text-primary">
                            ${item.price}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">
                            {item.description}
                          </p>
                          {item.tags && (
                             <div className="mt-4 flex flex-wrap gap-2">
                              {item.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                          )}
                        </CardContent>
                      </div>
                      {item.image && (
                        <div className="aspect-video w-full overflow-hidden">
                          <Image
                            src={item.image.url}
                            alt={item.name}
                            width={600}
                            height={400}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={item.image.hint}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <ContactSection />
      </main>
    </div>
  );
}
