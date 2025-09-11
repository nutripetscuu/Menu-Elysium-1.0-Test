import { Fish, Beef, GlassWater, UtensilsCrossed, Soup, Leaf, type LucideIcon } from "lucide-react";

export const iconMap = {
  Fish,
  Beef,
  GlassWater,
  UtensilsCrossed,
  Soup,
  Leaf,
};

export type IconName = keyof typeof iconMap;
