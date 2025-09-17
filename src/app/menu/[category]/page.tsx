"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Header } from "@/components/layout/header";
import { CategoryNav } from "@/components/category-nav";
import { MenuSection } from "@/components/menu-section";
import { ContactSection } from "@/components/contact-section";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/error-boundary";
import { MenuAPI } from "@/lib/api/menu";
import type { MenuCategoryWithItems } from "@/lib/types/database";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params['category'] as string;
  const [menuData, setMenuData] = useState<MenuCategoryWithItems[]>([]);
  const [currentCategory, setCurrentCategory] = useState<MenuCategoryWithItems | null>(null);
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
          
          // Find the current category
          const category = response.data.find(cat => cat.id === categoryId);
          if (category) {
            setCurrentCategory(category);
            setError(null);
          } else {
            // Category not found
            notFound();
          }
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
  }, [categoryId]);

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
  if (error || !currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-2xl font-bold mb-4">Error Loading Menu</h1>
          <p className="text-muted-foreground mb-4">{error || 'Category not found'}</p>
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
        <CategoryNav categories={menuData} activeCategory={categoryId} />
        
        <main className="px-4 py-6">
          <MenuSection 
            category={currentCategory}
            isActive={true}
          />
          
          <ContactSection />
        </main>
      </div>
    </ErrorBoundary>
  );
}