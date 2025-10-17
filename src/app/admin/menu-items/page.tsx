'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, ChevronDown, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getMenuItems, deleteMenuItem, toggleMenuItemAvailability, updateMenuItem } from '@/lib/actions/menu-items';
import type { MenuItem, ModifierGroup as MenuItemModifierGroup } from '@/lib/api/menu-items';
import { getCategories } from '@/lib/actions/categories';
import type { Category } from '@/lib/api/categories';
import { getAllModifierGroups } from '@/lib/actions/modifiers';
import type { ModifierGroup } from '@/lib/api/modifiers';
import { MenuItemForm } from '@/components/admin/menu-item-form';
// Force recompilation

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allModifierGroups, setAllModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [editingModifiers, setEditingModifiers] = useState<{ itemId: string; modifierGroupId: string } | null>(null);
  const { toast } = useToast();

  // Load menu items and categories
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [itemsData, categoriesData, modifierGroupsData] = await Promise.all([
        getMenuItems(),
        getCategories(),
        getAllModifierGroups(),
      ]);
      setMenuItems(itemsData);
      setCategories(categoriesData);
      setAllModifierGroups(modifierGroupsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  // Filter menu items based on search and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Handle availability toggle
  async function handleToggleAvailability(item: MenuItem) {
    try {
      const updatedItem = await toggleMenuItemAvailability(item.id);
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? updatedItem : i))
      );
      toast({
        title: 'Success',
        description: `${item.name} is now ${updatedItem.isAvailable ? 'available' : 'unavailable'}.`,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Handle delete
  async function handleDelete() {
    if (!itemToDelete) return;

    try {
      await deleteMenuItem(itemToDelete.id);
      setMenuItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      toast({
        title: 'Success',
        description: `${itemToDelete.name} has been deleted.`,
      });
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Get category name by ID
  function getCategoryName(categoryId: string): string {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  }

  // Toggle category collapse
  function toggleCategory(categoryId: string) {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }

  // Toggle modifier option for a menu item
  async function handleToggleModifierOption(item: MenuItem, modifierGroup: MenuItemModifierGroup, optionId: string, isEnabled: boolean) {
    try {
      const currentModifiers = item.modifierGroups || [];
      let updatedModifiers: MenuItemModifierGroup[];

      if (isEnabled) {
        // Remove the option from the modifier group
        updatedModifiers = currentModifiers.map(group => {
          if (group.id === modifierGroup.id) {
            return {
              ...group,
              options: (group.options || []).filter(opt => opt.id !== optionId)
            };
          }
          return group;
        }).filter(group => (group.options || []).length > 0); // Remove group if no options left
      } else {
        // Add the option to the modifier group
        const optionToAdd = allModifierGroups
          .find(g => g.id === modifierGroup.id)
          ?.options.find(opt => opt.id === optionId);

        if (!optionToAdd) return;

        const groupExists = currentModifiers.some(g => g.id === modifierGroup.id);

        if (groupExists) {
          updatedModifiers = currentModifiers.map(group => {
            if (group.id === modifierGroup.id) {
              return {
                ...group,
                options: [...(group.options || []), optionToAdd]
              };
            }
            return group;
          });
        } else {
          // Add the entire group with this option
          const fullGroup = allModifierGroups.find(g => g.id === modifierGroup.id);
          if (fullGroup) {
            updatedModifiers = [
              ...currentModifiers,
              {
                ...fullGroup,
                maxSelections: fullGroup.maxSelections ?? undefined,
                options: [optionToAdd]
              } as MenuItemModifierGroup
            ];
          } else {
            updatedModifiers = currentModifiers;
          }
        }
      }

      // Update the menu item
      await updateMenuItem(item.id, {
        modifierGroupIds: updatedModifiers.map(g => g.id)
      });

      // Refresh the menu items list
      await loadData();

      toast({
        title: 'Success',
        description: 'Modifier options updated successfully.',
      });
    } catch (error) {
      console.error('Error updating modifier options:', error);
      toast({
        title: 'Error',
        description: 'Failed to update modifier options. Please try again.',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading menu items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground">
            Manage your menu items, variants, and modifiers
          </p>
        </div>
        <Button onClick={() => { setItemToEdit(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== 'all'
              ? 'No menu items found matching your filters.'
              : 'No menu items yet. Add your first menu item to get started.'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Button className="mt-4" onClick={() => { setItemToEdit(null); setFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([categoryId, items]) => {
            const isCollapsed = collapsedCategories.has(categoryId);
            return (
              <div key={categoryId} className="space-y-4">
                <div
                  className="flex items-center gap-2 border-b pb-2 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded-t-lg transition-colors"
                  onClick={() => toggleCategory(categoryId)}
                >
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isCollapsed ? '-rotate-90' : ''
                    }`}
                  />
                  <h2 className="text-xl font-semibold flex-1">
                    {getCategoryName(categoryId)}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="grid gap-4">
                    {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => { setItemToEdit(item); setFormOpen(true); }}
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-md overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-medium">
                          {item.price && `$${item.price}`}
                          {item.priceMedium && ` / M: $${item.priceMedium}`}
                          {item.priceGrande && ` / G: $${item.priceGrande}`}
                          {item.variants && item.variants.length > 0 && (
                            <span>
                              {item.variants.map((v, idx) => (
                                <span key={`${item.id}-variant-${v.id || idx}`}>
                                  {idx > 0 && ' / '}
                                  {v.name}: ${v.price}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={`${item.id}-tag-${idx}`}
                                className="text-xs px-2 py-1 bg-muted rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.modifierGroups && item.modifierGroups.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.modifierGroups.map((group) => {
                              // Get all available options from the full modifier group
                              const fullGroup = allModifierGroups.find(g => g.id === group.id);
                              const allOptions = fullGroup?.options || [];
                              const enabledOptionIds = new Set((group.options || []).map(opt => opt.id));

                              return (
                                <Popover key={group.id}>
                                  <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <button
                                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                                      title={`Click to manage options`}
                                    >
                                      {group.name}
                                      <Settings2 className="h-3 w-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-3">
                                      <div className="font-semibold text-sm border-b pb-2">
                                        {group.name} Options
                                      </div>
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {allOptions.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">No options available</p>
                                        ) : (
                                          allOptions.map((option) => {
                                            const isEnabled = enabledOptionIds.has(option.id);
                                            return (
                                              <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                  id={`${item.id}-${group.id}-${option.id}`}
                                                  checked={isEnabled}
                                                  onCheckedChange={() => handleToggleModifierOption(item, group, option.id, isEnabled)}
                                                />
                                                <Label
                                                  htmlFor={`${item.id}-${group.id}-${option.id}`}
                                                  className="flex-1 cursor-pointer text-sm"
                                                >
                                                  <div className="flex justify-between">
                                                    <span>{option.label}</span>
                                                    {option.priceModifier !== 0 && (
                                                      <span className="text-muted-foreground">
                                                        {option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)}
                                                      </span>
                                                    )}
                                                  </div>
                                                </Label>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground border-t pt-2">
                                        {(group.options || []).length} of {allOptions.length} options enabled
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAvailability(item);
                        }}
                        title={
                          item.isAvailable
                            ? 'Mark as unavailable'
                            : 'Mark as available'
                        }
                      >
                        {item.isAvailable ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToEdit(item);
                          setFormOpen(true);
                        }}
                        title="Edit menu item"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        title="Delete menu item"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Menu Item Form */}
      <MenuItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        item={itemToEdit}
        categories={categories}
        onSuccess={loadData}
      />
    </div>
  );
}
