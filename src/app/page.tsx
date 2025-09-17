
"use client";

import { useEffect, useState } from 'react';
import { Header } from "@/components/layout/header";
import { CategoryNav } from "@/components/category-nav";
import { MenuSection } from "@/components/menu-section";
import { ContactSection } from "@/components/contact-section";
import { PromoBanner } from "@/components/promo-banner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/error-boundary";
import { MenuAPI } from "@/lib/api/menu";
import type { MenuCategoryWithItems } from "@/lib/types/database";

export default function MenuPage() {
  const [menuData, setMenuData] = useState<MenuCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const response = await MenuAPI.getMenuWithCategories();
        
        if (response.success && response.data) {
          setMenuData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to load menu data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
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
        <Header categories={menuData} />

        {/* Full-width promotional banner for mobile-first design */}
        <PromoBanner />

        <CategoryNav categories={menuData} activeCategory={null} />
        
        <main className="px-4 py-6 pt-8">
          {menuData.map((category) => (
            <MenuSection 
              key={category.id}
              category={category}
              isActive={false}
            />
          ))}
          
          <ContactSection />
        </main>
      </div>
    </ErrorBoundary>
  );
}
