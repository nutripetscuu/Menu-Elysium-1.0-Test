import * as LucideIcons from "lucide-react";

// Export all icons module (using any to avoid type conflicts with utility functions)
export const iconMap = LucideIcons as any;

// Helper function to get an icon component by name
export function getIconComponent(iconName: string): React.ComponentType<any> {
  const IconComponent = iconMap[iconName];

  // Check if it's a valid React component (can be function or object with $$typeof)
  if (IconComponent && (typeof IconComponent === 'function' || typeof IconComponent === 'object')) {
    return IconComponent;
  }

  // Fallback to UtensilsCrossed if icon not found
  return LucideIcons.UtensilsCrossed;
}

export type IconName = string;
