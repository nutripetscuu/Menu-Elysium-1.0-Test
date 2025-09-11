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
    name: "Appetizers",
    icon: "UtensilsCrossed",
    items: [
      {
        name: "Edamame",
        description: "Steamed young soybeans with sea salt.",
        price: "6",
        tags: ["V", "GF"],
      },
      {
        name: "Gyoza",
        description: "Pan-fried pork and vegetable dumplings.",
        price: "9",
      },
      {
        name: "Agedashi Tofu",
        description: "Lightly fried tofu in a savory dashi broth.",
        price: "8",
      },
      {
        name: "Seaweed Salad",
        description: "Classic Japanese salad with a sesame dressing.",
        price: "7",
        tags: ["V"],
      },
    ],
  },
  {
    id: "sushi-sashimi",
    name: "Sushi & Sashimi",
    icon: "Fish",
    items: [
      {
        name: "Maguro (Tuna)",
        description: "3 pieces of fresh, high-quality bluefin tuna.",
        price: "12",
      },
      {
        name: "Sake (Salmon)",
        description: "3 pieces of rich and fatty Atlantic salmon.",
        price: "9",
        tags: ["Popular"],
      },
      {
        name: "Hamachi (Yellowtail)",
        description: "3 pieces of delicate and buttery yellowtail.",
        price: "11",
      },
      {
        name: "Dragon Roll",
        description: "Eel and cucumber topped with avocado and tobiko.",
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
          "Rich pork bone broth, chashu pork, soft-boiled egg, and noodles.",
        price: "18",
        tags: ["Popular"],
      },
      {
        name: "Shoyu Ramen",
        description: "Soy sauce-based chicken broth, bamboo shoots, and nori.",
        price: "16",
      },
      {
        name: "Miso Ramen",
        description: "Fermented soybean broth with corn, butter, and bean sprouts.",
        price: "17",
      },
      {
        name: "Vegan Yasai Ramen",
        description: "Vegetable broth with seasonal greens, tofu, and mushrooms.",
        price: "17",
        tags: ["V"],
      },
    ],
  },
  {
    id: "grill",
    name: "From The Grill",
    icon: "Beef",
    items: [
      {
        name: "Wagyu Steak",
        description: "A5 Kagoshima Wagyu, served with wasabi and rock salt.",
        price: "55",
      },
      {
        name: "Black Cod with Miso",
        description: "Marinated in sweet miso and grilled to perfection.",
        price: "28",
        tags: ["Popular"],
      },
      {
        name: "Chicken Teriyaki",
        description: "Grilled chicken thigh with a classic sweet soy glaze.",
        price: "19",
      },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    icon: "GlassWater",
    items: [
      {
        name: "Asahi Super Dry",
        description: "Classic Japanese lager.",
        price: "8",
      },
      {
        name: "Dassai 45 'Otter Fest'",
        description: "Premium Junmai Daiginjo Sake, fruity and clean.",
        price: "18/glass",
      },
      {
        name: "Iced Matcha Latte",
        description: "Ceremonial grade matcha with your choice of milk.",
        price: "7",
        tags: ["NA"],
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
