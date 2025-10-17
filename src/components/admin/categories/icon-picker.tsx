'use client';

import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Common food & drink icons for quick access
const FEATURED_ICONS = [
  'Coffee',
  'Wine',
  'Beer',
  'GlassWater',
  'IceCream',
  'Cookie',
  'Cake',
  'Pizza',
  'Sandwich',
  'Salad',
  'Soup',
  'UtensilsCrossed',
  'Croissant',
  'CakeSlice',
  'ChefHat',
  'Flame',
  'Snowflake',
  'Sparkles',
  'Star',
  'Heart',
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get all available Lucide icons
  const allIcons = useMemo(() => {
    return Object.keys(Icons)
      .filter((key) => {
        // Filter out non-icon exports
        return (
          key !== 'createReactComponent' &&
          key !== 'default' &&
          typeof (Icons as any)[key] === 'function'
        );
      })
      .sort();
  }, []);

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return allIcons;
    return allIcons.filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    );
  }, [allIcons, search]);

  // Get featured icons that exist
  const featuredIcons = useMemo(() => {
    return FEATURED_ICONS.filter((icon) => allIcons.includes(icon));
  }, [allIcons]);

  // Render selected icon
  const renderSelectedIcon = () => {
    if (!value) {
      return <Icons.HelpCircle className="h-4 w-4" />;
    }
    const IconComponent = (Icons as any)[value];
    if (!IconComponent) {
      return <Icons.HelpCircle className="h-4 w-4" />;
    }
    return <IconComponent className="h-4 w-4" />;
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
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              {renderSelectedIcon()}
              <span>{value || 'Select an icon...'}</span>
            </div>
            {value && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-4">
              {/* Featured Icons Section */}
              {!search && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground px-1">
                    Popular for Food & Drinks
                  </h4>
                  <div className="grid grid-cols-8 gap-1">
                    {featuredIcons.map((iconName) => {
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
                            'flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent transition-colors',
                            isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                          )}
                          title={iconName}
                        >
                          <IconComponent className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Icons Section */}
              <div className="space-y-2">
                {!search && (
                  <h4 className="text-sm font-medium text-muted-foreground px-1">
                    All Icons ({filteredIcons.length})
                  </h4>
                )}
                {search && (
                  <h4 className="text-sm font-medium text-muted-foreground px-1">
                    Results ({filteredIcons.length})
                  </h4>
                )}
                <div className="grid grid-cols-8 gap-1">
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
                          'flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent transition-colors',
                          isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                        title={iconName}
                      >
                        <IconComponent className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No icons found for &quot;{search}&quot;
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {value && (
        <p className="text-xs text-muted-foreground">
          Selected: {value}
        </p>
      )}
    </div>
  );
}
