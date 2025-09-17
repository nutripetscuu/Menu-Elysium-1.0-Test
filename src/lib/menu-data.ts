
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
  sizes?: {
    medium: string;
    grande: string;
  };
};

export type MenuCategory = {
  id: string;
  name: string;
  icon: IconName;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: "calientes",
    name: "Calientes",
    icon: "Coffee",
    items: [
      {
        name: "Espresso",
        description: "Café concentrado de extracción perfecta.",
        price: "40",
      },
      {
        name: "Espresso Doble",
        description: "Doble shot de nuestro espresso premium.",
        price: "45",
      },
      {
        name: "Americano",
        description: "Espresso alargado con agua caliente.",
        price: "55",
      },
      {
        name: "Latte",
        description: "Espresso suave con leche vaporizada y espuma cremosa.",
        price: "65",
      },
      {
        name: "Capuccino",
        description: "Espresso con leche vaporizada y espuma densa.",
        price: "65",
      },
      {
        name: "Chocolate Caliente",
        description: "Chocolate premium con leche caliente y marshmallows.",
        price: "65",
      },
      {
        name: "Mocha",
        description: "Espresso con chocolate y leche vaporizada.",
        price: "70",
      },
      {
        name: "Dirty Chai",
        description: "Chai latte especiado con shot de espresso.",
        price: "75",
      },
      {
        name: "Taro",
        description: "Bebida cremosa de taro con leche vaporizada.",
        price: "80",
      },
      {
        name: "Matcha",
        description: "Té verde matcha premium con leche vaporizada.",
        price: "80",
      },
      {
        name: "Té",
        description: "Selección de tés: Manzanilla, Verde, Menta.",
        price: "50",
        tags: ["Manzanilla", "Verde", "Menta"],
      },
    ],
  },
  {
    id: "frappes",
    name: "Frappés",
    icon: "Snowflake",
    items: [
      {
        name: "Caramelo",
        description: "Frappé cremoso con delicioso sabor a caramelo.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Taro",
        description: "Frappé suave con exótico sabor a taro.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Matcha",
        description: "Frappé refrescante con auténtico té verde matcha.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Vainilla",
        description: "Frappé clásico con rico sabor a vainilla.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Arroz con leche",
        description: "Frappé único con sabor tradicional a arroz con leche.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Fresas con crema",
        description: "Frappé frutal con fresas frescas y crema.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Cookies & Cream",
        description: "Frappé indulgente con galletas y crema.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Chai",
        description: "Frappé especiado con mezcla aromática de chai.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Frapuccino",
        description: "Frappé estilo café con espresso y crema batida.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
    ],
  },
  {
    id: "en-las-rocas",
    name: "En las Rocas",
    icon: "Mountain",
    items: [
      {
        name: "Americano",
        description: "Espresso americano servido sobre hielo con agua fría.",
        price: "M: $60 | G: $65",
        sizes: { medium: "60", grande: "65" }
      },
      {
        name: "Espresso Tonic",
        description: "Refrescante combinación de espresso con agua tónica.",
        price: "M: $65 | G: $70",
        sizes: { medium: "65", grande: "70" }
      },
      {
        name: "🧊 Granizado Elysium",
        description: "Granizado especial de la casa con café y hielo.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "🧊 Tiramisú Latte",
        description: "Latte frío con sabor a tiramisú italiano.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Latte",
        description: "Latte clásico servido sobre hielo con leche fría.",
        price: "M: $70 | G: $75",
        sizes: { medium: "70", grande: "75" }
      },
      {
        name: "Mocha",
        description: "Mocha frío con chocolate y crema batida.",
        price: "M: $70 | G: $75",
        sizes: { medium: "70", grande: "75" }
      },
      {
        name: "Caramelo",
        description: "Café frío con delicioso jarabe de caramelo.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Taro",
        description: "Bebida fría de taro con leche y hielo.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Matcha",
        description: "Matcha latte frío con leche y hielo.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Vainilla Latte",
        description: "Latte frío con esencia de vainilla natural.",
        price: "M: $80 | G: $85",
        sizes: { medium: "80", grande: "85" }
      },
      {
        name: "Vainilla Cold Foam",
        description: "Café frío con espuma fría de vainilla.",
        price: "M: $85 | G: $90",
        sizes: { medium: "85", grande: "90" }
      },
      {
        name: "🧊 Matcha fresa",
        description: "Matcha frío con fresas frescas y hielo.",
        price: "M: $90 | G: $95",
        sizes: { medium: "90", grande: "95" }
      },
      {
        name: "🧊 Taro Fresa",
        description: "Taro frío con fresas naturales y hielo.",
        price: "M: $90 | G: $95",
        sizes: { medium: "90", grande: "95" }
      },
    ],
  },
  {
    id: "frescos",
    name: "Frescos",
    icon: "Droplets",
    items: [
      {
        name: "🍹 Margarita Cero",
        description: "Raspado de fresa y limón",
        price: "M: $65 | G: $70",
        sizes: { medium: "65", grande: "70" }
      },
      {
        name: "🍹 Trilogía tropical",
        description: "Limonada de fresa, mora azul o mango",
        price: "M: $60 | G: $65",
        sizes: { medium: "60", grande: "65" }
      },
      {
        name: "🍹 Agua Roja",
        description: "Agua mineral con fresa y limón",
        price: "M: $55 | G: $60",
        sizes: { medium: "55", grande: "60" }
      },
      {
        name: "Limonada Clásica",
        description: "Limonada tradicional refrescante",
        price: "M: $50 | G: $55",
        sizes: { medium: "50", grande: "55" }
      },
      {
        name: "Limonada Mineral",
        description: "Limonada con agua mineral gasificada",
        price: "M: $50 | G: $55",
        sizes: { medium: "50", grande: "55" }
      },
      {
        name: "Agua Natural",
        description: "Agua natural purificada",
        price: "25"
      },
      {
        name: "Agua Mineral",
        description: "Agua mineral gasificada",
        price: "50"
      },
    ],
  },
  {
    id: "paninis",
    name: "Paninis",
    icon: "Sandwich",
    items: [
      {
        name: "OLIMPO",
        description: "Panini de bistec con queso, lechuga, pimientos salteados y salsa a elegir.",
        price: "155",
      },
      {
        name: "ELISEO",
        description: "Panini de pollo con queso, tocino, lechuga y salsa a elegir.",
        price: "110",
      },
      {
        name: "CELESTE",
        description: "Panini de jamón con queso, lechuga y salsa a elegir.",
        price: "70",
      },
      {
        name: "SALSAS A ELEGIR:",
        description: "Chipotle, macha o salsa de la casa",
        price: "",
        tags: ["Opciones"]
      },
    ],
  },
  {
    id: "ensaladas",
    name: "Ensaladas",
    icon: "Salad",
    items: [
      {
        name: "CEASAR",
        description: "Lechuga orejona, pollo, queso parmesano, aderezo caesar, acompañada de un pedazo de pan.",
        price: "80",
      },
      {
        name: "🥬 ELYSIUM",
        description: "Lechuga orejona, espinaca, fresa, arándanos, queso de cabra y nuez, acompañada de vinagreta de la casa.",
        price: "110",
      },
    ],
  },
  {
    id: "toasts",
    name: "Toasts",
    icon: "Slice",
    items: [
      {
        name: "POLLO",
        description: "Costra de pan de la casa con pollo y pimientos salteados, acompañado de salsa de la casa, lechuga fresca y tomates cherry.",
        price: "120",
      },
      {
        name: "AVO TOAST",
        description: "Costra de pan de la casa con una ligera capa de jocoque, aguacate fresco y ajonjolí, coronado con tomates cherry salteados y acompañado de lechuga y tomates cherry frescos.",
        price: "85",
      },
      {
        name: "*Agrega huevo",
        description: "+ $15",
        price: "",
        tags: ["Add-on"]
      },
      {
        name: "PERA",
        description: "Costra de pan de la casa con queso crema, láminas de pera y queso panela, acompañado de nueces, un toque de miel, fresas y moras frescas.",
        price: "110",
      },
    ],
  },
  {
    id: "para-compartir",
    name: "Para compartir",
    icon: "Users",
    items: [
      {
        name: "PAPAS DE LA CASA",
        description: "Mezcla de camote y papas fritas acompañadas de salsa catsup con chile quebrado.",
        price: "85",
      },
      {
        name: "PAPAS PREPARADAS",
        description: "Papas caseras preparadas con salsa picante, jugo maggi, limón, rielitos y cacahuates.",
        price: "90",
      },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    icon: "Cake",
    items: [
      {
        name: "PASTEL DE CHOCOLATE",
        description: "Rebanada de pastel de chocolate relleno de queso crema.",
        price: "75",
      },
      {
        name: "PASTEL DE ZANAHORIA",
        description: "Rebanada de pastel de zanahoria relleno de queso crema.",
        price: "85",
      },
      {
        name: "PASTEL DE VAINILLA",
        description: "Rebanada de pastel de vainilla relleno de mermelada de fresa.",
        price: "75",
      },
    ],
  },
];
