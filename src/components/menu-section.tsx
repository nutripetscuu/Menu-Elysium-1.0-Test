"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getIconComponent, type IconName } from "@/components/icon-map";
import { ProductModal } from "@/components/product-modal";
import type { MenuCategoryWithItems, MenuItem } from "@/lib/types/database";

interface MenuSectionProps {
  category: MenuCategoryWithItems;
  isActive?: boolean;
}

export function MenuSection({ category }: MenuSectionProps) {
  const Icon = getIconComponent(category.icon);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <section
      id={category.id}
      className="mb-8 scroll-mt-20"
      aria-labelledby={`${category.id}-heading`}
    >
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-6 w-6 text-restaurant-muted-coral" />
        <h2
          id={`${category.id}-heading`}
          className="text-3xl font-script text-restaurant-charcoal-black"
        >
          {category.name}
        </h2>
      </div>
      
      <div className="space-y-4">
        {category.items.map((item) => (
          <div key={item.name} className="group">
            <div
              className="bg-white rounded-lg shadow-sm border border-restaurant-warm-beige/30 p-5 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
            >
              {item.tags && item.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-restaurant-muted-coral/10 text-restaurant-deep-burgundy border-restaurant-muted-coral/20">
                      {tag === "Popular" ? "Nuevo" : tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className={`flex flex-col ${(item.sizes || (item.variants && item.variants.length > 0)) ? 'space-y-1' : 'space-y-3'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold tracking-tight text-restaurant-charcoal-black leading-tight">
                      {item.name}
                    </h3>
                    {(item.sizes || (item.variants && item.variants.length > 0)) && (
                      <p className="text-sm text-restaurant-warm-gray leading-relaxed mt-1 pr-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {item.variants && item.variants.length > 0 ? (
                      // New variants system - show count and price range
                      <div className="text-right">
                        <p className="text-xs text-restaurant-warm-gray/70 mb-0.5">
                          {item.variants.length} {item.variants.length === 1 ? 'Variante' : 'Variantes'}
                        </p>
                        <p className="text-lg font-bold text-restaurant-deep-burgundy leading-none">
                          ${Math.min(...item.variants.map(v => v.price)).toFixed(2)} - ${Math.max(...item.variants.map(v => v.price)).toFixed(2)}
                        </p>
                      </div>
                    ) : item.sizes ? (
                      // Legacy M/G sizes
                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold text-restaurant-deep-burgundy leading-none">
                          M: ${item.sizes.medium}
                        </p>
                        <p className="text-lg font-bold text-restaurant-deep-burgundy leading-none">
                          G: ${item.sizes.grande}
                        </p>
                      </div>
                    ) : item.price ? (
                      // Single price
                      <p className="text-xl font-bold text-restaurant-deep-burgundy">
                        ${typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                </div>

                {!item.sizes && !(item.variants && item.variants.length > 0) && (
                  <p className="text-sm text-restaurant-warm-gray leading-relaxed">
                    {item.description}
                  </p>
                )}

                {item.portion && (
                  <p className="text-xs text-restaurant-warm-gray/80 font-medium bg-restaurant-warm-beige/50 px-2 py-1 rounded-full inline-block self-start">
                    {item.portion}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      <ProductModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}