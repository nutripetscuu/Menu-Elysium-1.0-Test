
import type { IconName } from "@/components/icon-map";

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
  portion?: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: IconName;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
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
    id: "sushi",
    name: "Sushi",
    icon: "Fish",
    items: [
      {
        name: "Maguro (Atún)",
        description: "3 piezas de atún aleta azul fresco de alta calidad.",
        price: "12",
        portion: "3 pz"
      },
      {
        name: "Sake (Salmón)",
        description: "3 piezas de rico y graso salmón del Atlántico.",
        price: "9",
        tags: ["Popular"],
        portion: "3 pz"
      },
      {
        name: "Hamachi (Jurel)",
        description: "3 piezas de delicado y suave jurel.",
        price: "11",
        portion: "3 pz"
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
        portion: "150g"
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
