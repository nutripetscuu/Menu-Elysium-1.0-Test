"use client";

import { useEffect, useState } from 'react';
import { Header } from "@/components/layout/header";
import { CategoryNav } from "@/components/category-nav";
import { MenuSection } from "@/components/menu-section";
import { ContactSection } from "@/components/contact-section";
import { PromoBanner } from "@/components/promo-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/error-boundary";
import { supabase } from "@/lib/supabase/client";
import type { MenuCategoryWithItems } from "@/lib/types/database";

interface MenuPageClientProps {
  restaurantId: string;
  restaurantSlug: string;
}

export function MenuPageClient({ restaurantId, restaurantSlug }: MenuPageClientProps) {
  const [menuData, setMenuData] = useState<MenuCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load menu data for specific restaurant
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        console.log(`[MENU] Fetching menu for restaurant: ${restaurantSlug} (${restaurantId})`);

        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            icon,
            position,
            is_active,
            created_at,
            updated_at,
            items:menu_items(
              id,
              category_id,
              name,
              description,
              price,
              price_medium,
              price_grande,
              image_url,
              tags,
              portion,
              position,
              is_available,
              created_at,
              updated_at,
              menu_item_modifiers(
                modifier_group_id,
                position,
                modifier_groups(
                  id,
                  name,
                  type,
                  required,
                  min_selections,
                  max_selections,
                  position,
                  options:modifier_options(
                    id,
                    label,
                    price_modifier,
                    is_default,
                    position
                  )
                )
              ),
              variants:menu_item_variants(
                id,
                name,
                price,
                position
              )
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .order('position');

        if (categoriesError) {
          throw new Error(`Failed to load menu: ${categoriesError.message}`);
        }

        // Transform to match MenuCategoryWithItems type
        const formattedData: MenuCategoryWithItems[] = (categories || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          position: cat.position,
          isActive: cat.is_active,
          createdAt: cat.created_at,
          updatedAt: cat.updated_at || undefined,
          items: (cat.items || [])
            .sort((a: any, b: any) => a.position - b.position)
            .map((item: any) => {
              // Transform modifier groups with full details
              const modifierGroups = (item.menu_item_modifiers || [])
                .filter((mim: any) => mim.modifier_groups)
                .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
                .map((mim: any) => ({
                  id: mim.modifier_groups.id,
                  name: mim.modifier_groups.name,
                  type: mim.modifier_groups.type as 'single' | 'multiple' | 'boolean',
                  required: mim.modifier_groups.required,
                  minSelections: mim.modifier_groups.min_selections,
                  maxSelections: mim.modifier_groups.max_selections,
                  position: mim.modifier_groups.position,
                  options: (mim.modifier_groups.options || [])
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((opt: any) => ({
                      id: opt.id,
                      label: opt.label,
                      priceModifier: opt.price_modifier,
                      isDefault: opt.is_default,
                      position: opt.position,
                    }))
                }));

              return {
                id: item.id,
                categoryId: item.category_id,
                name: item.name,
                description: item.description,
                price: item.price || (item.price_medium && item.price_grande ? `M: $${item.price_medium} | G: $${item.price_grande}` : ''),
                imageUrl: item.image_url || undefined,
                tags: item.tags || [],
                portion: item.portion || undefined,
                sizes: (item.price_medium && item.price_grande) ? {
                  medium: item.price_medium.toString(),
                  grande: item.price_grande.toString()
                } : undefined,
                modifierGroups: modifierGroups,
                variants: (item.variants || [])
                  .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
                  .map((v: { id: string, name: string, price: number, position: number }) => ({
                    id: v.id,
                    name: v.name,
                    price: v.price,
                    position: v.position
                  })),
                position: item.position,
                isAvailable: item.is_available,
                createdAt: item.created_at,
                updatedAt: item.updated_at || undefined,
              };
            })
        }));

        console.log(`[MENU] Loaded ${formattedData.length} categories for ${restaurantSlug}`);
        setMenuData(formattedData);

        // Check if there's a hash in the URL
        const hash = window.location.hash.slice(1);
        const categoryExists = formattedData.find(cat => cat.id === hash);

        if (hash && categoryExists) {
          setActiveCategory(hash);
        } else {
          setActiveCategory(null);
        }

        setError(null);
      } catch (err) {
        console.error('[MENU] Error loading menu:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantId, restaurantSlug]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    window.history.replaceState(null, '', `#${categoryId}`);
  };

  // Handle showing all sections
  const handleShowAll = () => {
    setActiveCategory(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && menuData.length > 0) {
        const categoryExists = menuData.find(cat => cat.id === hash);
        if (categoryExists && hash !== activeCategory) {
          setActiveCategory(hash);
          window.history.replaceState(null, '', `#${hash}`);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [menuData, activeCategory]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Loading {restaurantSlug} menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || menuData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-2xl font-bold mb-4">Error Loading Menu</h1>
          <p className="text-muted-foreground mb-2">Restaurant: {restaurantSlug}</p>
          <p className="text-muted-foreground mb-4">{error || 'No menu data available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header categories={menuData} onShowAll={handleShowAll} />

        {/* Full-width promotional banner */}
        <PromoBanner restaurantId={restaurantId} />

        <CategoryNav
          categories={menuData}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <main className="px-4 py-6 pt-8">
          {activeCategory ? (
            // Single section mode
            (() => {
              const currentCategory = menuData.find(cat => cat.id === activeCategory);
              return currentCategory ? (
                <MenuSection
                  key={currentCategory.id}
                  category={currentCategory}
                  isActive={true}
                />
              ) : null;
            })()
          ) : (
            // All sections mode
            menuData.map((category) => (
              <MenuSection
                key={category.id}
                category={category}
                isActive={false}
              />
            ))
          )}

          <ContactSection />
        </main>
      </div>
    </ErrorBoundary>
  );
}
