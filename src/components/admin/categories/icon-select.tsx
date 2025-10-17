'use client';

import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon search keywords - maps common search terms to icon names
const ICON_KEYWORDS: Record<string, string[]> = {
  // Food & Drinks keywords
  'food': ['Coffee', 'Pizza', 'Sandwich', 'Cookie', 'Cake', 'Salad', 'Soup', 'Croissant', 'Beef', 'Fish', 'Egg'],
  'drink': ['Coffee', 'Wine', 'Beer', 'GlassWater', 'Milk', 'Martini'],
  'beverage': ['Coffee', 'Wine', 'Beer', 'GlassWater', 'Milk', 'Martini'],
  'alcohol': ['Wine', 'Beer', 'Martini'],
  'dessert': ['Cookie', 'Cake', 'CakeSlice', 'IceCream', 'IceCreamCone'],
  'sweet': ['Cookie', 'Cake', 'CakeSlice', 'IceCream', 'IceCreamCone'],
  'fruit': ['Apple', 'Cherry', 'Citrus', 'Grape', 'Banana'],
  'vegetable': ['Carrot', 'Salad'],
  'meat': ['Beef'],
  'hot': ['Coffee', 'Soup', 'Flame'],
  'cold': ['IceCream', 'IceCreamCone', 'Snowflake', 'Beer'],
  // Restaurant keywords
  'restaurant': ['ConciergeBell', 'ChefHat', 'UtensilsCrossed', 'Utensils', 'CookingPot'],
  'service': ['ConciergeBell', 'Bell', 'BellRing'],
  'shop': ['ShoppingBag', 'ShoppingCart', 'Store'],
  'store': ['Store', 'ShoppingBag', 'ShoppingCart'],
  'special': ['Sparkles', 'Star', 'Crown', 'Award'],
  'celebration': ['PartyPopper', 'Gift', 'Crown'],
  'party': ['PartyPopper', 'Gift'],
  // Status keywords
  'favorite': ['Heart', 'Star'],
  'like': ['Heart', 'ThumbsUp'],
  'success': ['Check', 'CheckCircle', 'BadgeCheck'],
  'error': ['X', 'XCircle', 'AlertCircle'],
  'warning': ['AlertTriangle', 'AlertCircle'],
  'popular': ['Star', 'TrendingUp', 'Flame'],
  // Time keywords
  'time': ['Clock', 'Clock1', 'Clock2', 'Clock3', 'Timer', 'Hourglass'],
  'date': ['Calendar', 'CalendarDays', 'CalendarClock'],
  'schedule': ['Calendar', 'CalendarDays', 'Clock'],
  'day': ['Sun', 'Sunrise', 'Sunset'],
  'night': ['Moon', 'CloudMoon'],
  // Weather keywords
  'weather': ['Sun', 'Moon', 'Cloud', 'CloudRain', 'Wind'],
  'rain': ['CloudRain', 'Umbrella', 'Droplet', 'Droplets'],
  'storm': ['CloudLightning', 'Zap'],
  // Money keywords
  'money': ['DollarSign', 'Euro', 'PoundSterling', 'Coins', 'Wallet', 'Banknote'],
  'payment': ['CreditCard', 'Wallet', 'DollarSign'],
  'price': ['Tag', 'Tags', 'DollarSign'],
  'business': ['Briefcase', 'Building2', 'Store'],
  // Communication keywords
  'contact': ['Phone', 'Mail', 'MessageCircle'],
  'message': ['MessageCircle', 'MessageSquare', 'Mail', 'Send'],
  'email': ['Mail', 'MailOpen', 'Send'],
  'call': ['Phone', 'PhoneCall'],
  'notification': ['Bell', 'BellRing'],
  'people': ['Users', 'User'],
  'person': ['User'],
  // Actions keywords
  'delete': ['Trash', 'Trash2', 'X'],
  'remove': ['Trash', 'Trash2', 'Minus'],
  'add': ['Plus', 'PlusCircle'],
  'edit': ['Edit', 'Edit2'],
  'view': ['Eye'],
  'hide': ['EyeOff'],
  'share': ['Share', 'Share2'],
  'download': ['Download'],
  'upload': ['Upload'],
};

// Curated icon list (~200 most relevant icons)
const ICON_CATEGORIES = {
  'Food & Drinks': [
    'Coffee', 'Wine', 'Beer', 'GlassWater', 'Milk', 'Soup', 'Pizza', 'Sandwich',
    'Cookie', 'Cake', 'CakeSlice', 'IceCream', 'IceCreamCone', 'Salad', 'Croissant',
    'Beef', 'Fish', 'Egg', 'Apple', 'Cherry', 'Citrus', 'Grape', 'Banana',
    'Carrot', 'ChefHat', 'UtensilsCrossed', 'Utensils', 'CookingPot', 'Martini',
  ],
  'Restaurant & Service': [
    'ConciergeBell', 'ShoppingBag', 'ShoppingCart', 'Warehouse',
    'Building', 'Home', 'Flame', 'Snowflake', 'Sparkles',
    'Award', 'BadgeCheck', 'Crown', 'Gift', 'PartyPopper', 'Ticket',
  ],
  'Symbols & Status': [
    'Star', 'StarHalf', 'Heart', 'ThumbsUp', 'Check', 'CheckCircle', 'CheckCircle2',
    'X', 'XCircle', 'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle',
    'Plus', 'PlusCircle', 'Minus', 'MinusCircle', 'Circle', 'CircleDot',
    'Square', 'Triangle', 'Diamond', 'Hexagon', 'Verified', 'BadgeAlert',
  ],
  'Time & Date': [
    'Clock', 'Clock1', 'Clock2', 'Clock3', 'Clock10', 'Timer', 'Hourglass',
    'Calendar', 'CalendarDays', 'CalendarClock', 'CalendarCheck',
    'Sunrise', 'Sunset', 'CloudSun', 'CloudMoon',
  ],
  'Navigation & Actions': [
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft',
    'ChevronUp', 'ChevronDown', 'ChevronsRight', 'ChevronsLeft', 'Menu', 'MoreHorizontal',
    'MoreVertical', 'Settings', 'Settings2', 'Sliders', 'Filter', 'Search',
    'Eye', 'EyeOff', 'Edit', 'Edit2', 'Trash', 'Trash2', 'Save', 'Download',
    'Upload', 'Share', 'Share2', 'Copy', 'ExternalLink', 'Link', 'Unlink',
  ],
  'Communication': [
    'Mail', 'MailOpen', 'Send', 'MessageCircle', 'MessageSquare', 'Phone',
    'PhoneCall', 'PhoneIncoming', 'PhoneOutgoing', 'Bell', 'BellRing', 'BellOff',
    'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Mic', 'MicOff', 'Video',
    'VideoOff', 'Users', 'User', 'UserPlus', 'UserMinus', 'UserCheck',
  ],
  'Business & Money': [
    'DollarSign', 'Euro', 'PoundSterling', 'CreditCard', 'Wallet', 'Coins',
    'Banknote', 'Receipt', 'TrendingUp', 'TrendingDown', 'BarChart', 'LineChart',
    'PieChart', 'Activity', 'Briefcase', 'Building2', 'Store', 'Tag', 'Tags',
    'Target', 'Package',
  ],
  'Weather & Nature': [
    'Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'CloudDrizzle', 'CloudLightning',
    'Wind', 'Droplet', 'Droplets', 'Umbrella', 'Zap', 'TreeDeciduous', 'TreePine',
    'Flower', 'Flower2', 'Leaf', 'Palmtree', 'Mountain', 'MountainSnow',
  ],
  'Technology': [
    'Smartphone', 'Tablet', 'Monitor', 'Tv', 'Laptop', 'Mouse', 'Keyboard',
    'Printer', 'Wifi', 'WifiOff', 'Bluetooth', 'Battery', 'BatteryCharging',
    'Power', 'PowerOff', 'Plug', 'Cpu', 'HardDrive', 'Server', 'Database',
  ],
  'Files & Folders': [
    'File', 'FileText', 'FileCode', 'FileImage', 'Files', 'Folder', 'FolderOpen',
    'FolderPlus', 'Archive', 'Paperclip', 'Bookmark', 'BookmarkPlus', 'Book',
    'BookOpen', 'Newspaper', 'Clipboard', 'ClipboardList', 'ClipboardCheck',
  ],
};

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IconSelect({ value, onChange, disabled }: IconSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Flatten all icons
  const allIcons = useMemo(() => {
    const icons: string[] = [];
    Object.values(ICON_CATEGORIES).forEach((iconList) => {
      icons.push(...iconList);
    });
    return icons;
  }, []);

  // Filter icons based on search with keyword matching
  const filteredIcons = useMemo(() => {
    if (!search) return allIcons;
    const searchLower = search.toLowerCase();

    // Create a Set to avoid duplicates
    const matchedIcons = new Set<string>();

    // 1. Direct name match (e.g., "coffee" matches "Coffee")
    allIcons.forEach((icon) => {
      if (icon.toLowerCase().includes(searchLower)) {
        matchedIcons.add(icon);
      }
    });

    // 2. Keyword match (e.g., "food" matches Coffee, Pizza, etc.)
    Object.entries(ICON_KEYWORDS).forEach(([keyword, icons]) => {
      if (keyword.includes(searchLower) || searchLower.includes(keyword)) {
        icons.forEach((icon) => {
          if (allIcons.includes(icon)) {
            matchedIcons.add(icon);
          }
        });
      }
    });

    // Convert Set back to Array, maintaining original order
    return allIcons.filter((icon) => matchedIcons.has(icon));
  }, [allIcons, search]);

  // Render the selected icon or placeholder
  const renderSelectedIcon = () => {
    if (!value) {
      return <Icons.ImageIcon className="h-5 w-5 text-muted-foreground" />;
    }
    const IconComponent = (Icons as any)[value];
    if (!IconComponent) {
      return <Icons.ImageIcon className="h-5 w-5 text-muted-foreground" />;
    }
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="space-y-2">
      <Label>Icon</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              {renderSelectedIcon()}
              <span className="text-sm text-muted-foreground">
                {value || 'Select an icon...'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[420px] p-0"
          align="start"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Search Bar */}
          <div className="p-3 border-b sticky top-0 bg-background z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Icon Grid */}
          <div
            className="overflow-y-scroll overflow-x-hidden overscroll-contain"
            style={{
              height: '320px',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="p-3">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-10 gap-1">
                  {filteredIcons.map((iconName) => {
                    const IconComponent = (Icons as any)[iconName];
                    const isSelected = value === iconName;
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          onChange(iconName);
                          setOpen(false);
                          setSearch('');
                        }}
                        className={cn(
                          'flex items-center justify-center p-2.5 rounded-md hover:bg-accent transition-colors',
                          isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                        title={iconName}
                        type="button"
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No icons found for &quot;{search}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/50 text-xs text-center text-muted-foreground">
            {filteredIcons.length} icons {search && `matching "${search}"`}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
