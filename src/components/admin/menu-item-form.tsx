'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createMenuItem, updateMenuItem } from '@/lib/actions/menu-items';
import type { MenuItem, MenuItemInput } from '@/lib/api/menu-items';
import { getAllModifierGroups, createModifierGroup, updateModifierGroup as updateModifierGroupAPI, deleteModifierGroup } from '@/lib/actions/modifiers';
import type { ModifierGroup as DBModifierGroup } from '@/lib/api/modifiers';
import type { Category } from '@/lib/api/categories';

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Modifier {
  id: string;
  name: string;
  price: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  multiSelect: boolean;
  modifiers: Modifier[];
}

interface Ingredient {
  id: string;
  name: string;
  canExclude: boolean;
}

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem | null;
  categories: Category[];
  onSuccess: () => void;
}

export function MenuItemForm({
  open,
  onOpenChange,
  item,
  categories,
  onSuccess,
}: MenuItemFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Basic Info State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Pricing State - New unified system with unlimited variants support
  const [pricingType, setPricingType] = useState<'single' | 'legacy' | 'variants'>('single');
  const [basePrice, setBasePrice] = useState('');
  const [mediumPrice, setMediumPrice] = useState(''); // Legacy Medium/Grande
  const [grandePrice, setGrandePrice] = useState(''); // Legacy Medium/Grande

  // Variants State - Now used for unlimited size variants
  const [variants, setVariants] = useState<Variant[]>([]);

  // Modifiers State - OLD (for custom modifiers per item - deprecated)
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  // Modifiers State - NEW (database-driven shared modifiers)
  const [availableModifierGroups, setAvailableModifierGroups] = useState<DBModifierGroup[]>([]);
  const [selectedModifierGroupIds, setSelectedModifierGroupIds] = useState<string[]>([]);

  // Track which specific options are enabled for each modifier group
  const [selectedModifierOptions, setSelectedModifierOptions] = useState<Record<string, Set<string>>>({});

  // New custom modifier state
  const [newModifierGroupName, setNewModifierGroupName] = useState('');
  const [newModifierGroupType, setNewModifierGroupType] = useState<'single' | 'multiple' | 'boolean'>('single');
  const [newModifierGroupRequired, setNewModifierGroupRequired] = useState(false);
  const [newModifierGroupOptions, setNewModifierGroupOptions] = useState<{ id: string; label: string; priceModifier: number; isDefault: boolean }[]>([]);

  // UI State - Show/hide previously registered modifiers
  const [showPreviousModifiers, setShowPreviousModifiers] = useState(false);

  // Editing State - Track which modifier group is being edited (global edits)
  const [editingModifierGroupId, setEditingModifierGroupId] = useState<string | null>(null);
  const [editingModifierGroupName, setEditingModifierGroupName] = useState('');
  const [editingModifierGroupOptions, setEditingModifierGroupOptions] = useState<{ id: string; label: string; priceModifier: number; isDefault: boolean; position: number }[]>([]);

  // Ingredients State
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Load available modifier groups from database when form opens
  useEffect(() => {
    async function loadModifierGroups() {
      try {
        const groups = await getAllModifierGroups();
        setAvailableModifierGroups(groups);
      } catch (error) {
        console.error('Failed to load modifier groups:', error);
        toast({
          title: 'Error',
          description: 'Failed to load modifier groups.',
          variant: 'destructive',
        });
      }
    }

    if (open) {
      loadModifierGroups();
    }
  }, [open]);

  // Load item data if editing
  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setCategoryId(item.categoryId);
      setImageUrl(item.imageUrl || '');
      setIsAvailable(item.isAvailable);
      setTags(item.tags || []);

      // Determine pricing type and load prices
      if (item.variants && item.variants.length > 0) {
        // New variants system (unlimited)
        setPricingType('variants');
        setBasePrice('');
        setMediumPrice('');
        setGrandePrice('');
        setVariants(item.variants.map(v => ({
          id: v.id || crypto.randomUUID(),
          name: v.name,
          price: v.price,
        })));
      } else if (item.price) {
        // Single price
        setPricingType('single');
        setBasePrice(item.price.toString());
        setMediumPrice('');
        setGrandePrice('');
        setVariants([]);
      } else if (item.priceMedium && item.priceGrande) {
        // Legacy Medium/Grande
        setPricingType('legacy');
        setBasePrice('');
        setMediumPrice(item.priceMedium.toString());
        setGrandePrice(item.priceGrande.toString());
        setVariants([]);
      }

      // Load assigned modifier groups with their selected options
      if (item.modifierGroups && item.modifierGroups.length > 0) {
        // Check if modifierGroups contains full objects or just IDs
        if (typeof item.modifierGroups[0] === 'string') {
          // Legacy: just IDs
          setSelectedModifierGroupIds(item.modifierGroups as unknown as string[]);
          setSelectedModifierOptions({});
        } else {
          // New: full objects with options
          const groupIds: string[] = [];
          const optionsMap: Record<string, Set<string>> = {};

          (item.modifierGroups as any[]).forEach((group: any) => {
            groupIds.push(group.id);
            optionsMap[group.id] = new Set(group.options.map((opt: any) => opt.id));
          });

          setSelectedModifierGroupIds(groupIds);
          setSelectedModifierOptions(optionsMap);
        }
      } else {
        setSelectedModifierGroupIds([]);
        setSelectedModifierOptions({});
      }

      // Load ingredients if present
      if (item.ingredients && item.ingredients.length > 0) {
        setIngredients(item.ingredients.map(ing => ({
          id: ing.id || crypto.randomUUID(),
          name: ing.name,
          canExclude: ing.canExclude,
        })));
      } else {
        setIngredients([]);
      }
    } else {
      resetForm();
    }
  }, [item]);

  function resetForm() {
    setName('');
    setDescription('');
    setCategoryId('');
    setPricingType('single');
    setBasePrice('');
    setMediumPrice('');
    setGrandePrice('');
    setImageUrl('');
    setIsAvailable(true);
    setTags([]);
    setTagInput('');
    setVariants([]);
    setModifierGroups([]);
    setSelectedModifierGroupIds([]);
    setSelectedModifierOptions({});
    setNewModifierGroupName('');
    setNewModifierGroupType('single');
    setNewModifierGroupRequired(false);
    setNewModifierGroupOptions([]);
    setIngredients([]);
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function addVariant() {
    setVariants([
      ...variants,
      { id: crypto.randomUUID(), name: '', price: 0 },
    ]);
  }

  function updateVariant(id: string, field: 'name' | 'price', value: string | number) {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: field === 'price' ? parseFloat(value as string) || 0 : value } : v))
    );
  }

  function removeVariant(id: string) {
    setVariants(variants.filter((v) => v.id !== id));
  }

  function addModifierGroup() {
    setModifierGroups([
      ...modifierGroups,
      {
        id: crypto.randomUUID(),
        name: '',
        multiSelect: false,
        modifiers: [],
      },
    ]);
  }

  function updateModifierGroup(id: string, field: 'name' | 'multiSelect', value: string | boolean) {
    setModifierGroups(
      modifierGroups.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  }

  function removeModifierGroup(id: string) {
    setModifierGroups(modifierGroups.filter((g) => g.id !== id));
  }

  function addModifier(groupId: string) {
    setModifierGroups(
      modifierGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              modifiers: [
                ...g.modifiers,
                { id: crypto.randomUUID(), name: '', price: 0 },
              ],
            }
          : g
      )
    );
  }

  function updateModifier(groupId: string, modifierId: string, field: 'name' | 'price', value: string | number) {
    setModifierGroups(
      modifierGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              modifiers: g.modifiers.map((m) =>
                m.id === modifierId ? { ...m, [field]: value } : m
              ),
            }
          : g
      )
    );
  }

  function removeModifier(groupId: string, modifierId: string) {
    setModifierGroups(
      modifierGroups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              modifiers: g.modifiers.filter((m) => m.id !== modifierId),
            }
          : g
      )
    );
  }

  function addIngredient() {
    setIngredients([
      ...ingredients,
      { id: crypto.randomUUID(), name: '', canExclude: true },
    ]);
  }

  function updateIngredient(id: string, field: 'name' | 'canExclude', value: string | boolean) {
    setIngredients(
      ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  function removeIngredient(id: string) {
    setIngredients(ingredients.filter((i) => i.id !== id));
  }

  // New modifier group creation functions
  function addNewModifierOption() {
    setNewModifierGroupOptions([
      ...newModifierGroupOptions,
      {
        id: crypto.randomUUID(),
        label: '',
        priceModifier: 0,
        isDefault: false,
      },
    ]);
  }

  function updateNewModifierOption(id: string, field: 'label' | 'priceModifier' | 'isDefault', value: string | number | boolean) {
    setNewModifierGroupOptions(
      newModifierGroupOptions.map((opt) =>
        opt.id === id ? { ...opt, [field]: field === 'priceModifier' ? parseFloat(value as string) || 0 : value } : opt
      )
    );
  }

  function removeNewModifierOption(id: string) {
    setNewModifierGroupOptions(newModifierGroupOptions.filter((opt) => opt.id !== id));
  }

  async function handleCreateNewModifierGroup() {
    // Validation
    if (!newModifierGroupName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a modifier group name.',
        variant: 'destructive',
      });
      return;
    }

    if (newModifierGroupOptions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one modifier option.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all options have labels
    for (const option of newModifierGroupOptions) {
      if (!option.label.trim()) {
        toast({
          title: 'Validation Error',
          description: 'All modifier options must have a label.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      // Create custom modifier group ID
      const groupId = `custom_${newModifierGroupName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

      // Create the modifier group in database
      const newGroup = await createModifierGroup({
        id: groupId,
        name: newModifierGroupName.trim(),
        type: newModifierGroupType,
        required: newModifierGroupRequired,
        minSelections: newModifierGroupRequired ? 1 : 0,
        maxSelections: newModifierGroupType === 'single' ? 1 : null,
        position: availableModifierGroups.length,
        options: newModifierGroupOptions.map((opt, index) => ({
          id: `${groupId}_opt_${index}`,
          label: opt.label.trim(),
          priceModifier: opt.priceModifier,
          isDefault: opt.isDefault,
          position: index,
        })),
      });

      // Add to available groups
      setAvailableModifierGroups([...availableModifierGroups, newGroup]);

      // Select the newly created group
      setSelectedModifierGroupIds([...selectedModifierGroupIds, newGroup.id]);

      // Reset new modifier form
      setNewModifierGroupName('');
      setNewModifierGroupType('single');
      setNewModifierGroupRequired(false);
      setNewModifierGroupOptions([]);

      toast({
        title: 'Success',
        description: 'New modifier group created and assigned to this item.',
      });
    } catch (error) {
      console.error('Failed to create modifier group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create modifier group. Please try again.',
        variant: 'destructive',
      });
    }
  }

  function toggleModifierGroupSelection(groupId: string) {
    setSelectedModifierGroupIds((prev) => {
      if (prev.includes(groupId)) {
        // Unselect the group
        setSelectedModifierOptions((opts) => {
          const newOpts = { ...opts };
          delete newOpts[groupId];
          return newOpts;
        });
        return prev.filter((id) => id !== groupId);
      } else {
        // Select the group - initialize with all options enabled by default
        const group = availableModifierGroups.find((g) => g.id === groupId);
        if (group) {
          setSelectedModifierOptions((opts) => ({
            ...opts,
            [groupId]: new Set(group.options.map((opt) => opt.id)),
          }));
        }
        return [...prev, groupId];
      }
    });
  }

  function toggleModifierOption(groupId: string, optionId: string) {
    setSelectedModifierOptions((prev) => {
      const newOptions = { ...prev };
      if (!newOptions[groupId]) {
        newOptions[groupId] = new Set();
      }

      const groupOptions = new Set(newOptions[groupId]);
      if (groupOptions.has(optionId)) {
        groupOptions.delete(optionId);
      } else {
        groupOptions.add(optionId);
      }

      newOptions[groupId] = groupOptions;
      return newOptions;
    });
  }

  // Start editing a modifier group (global edit)
  function startEditingModifierGroup(group: DBModifierGroup) {
    setEditingModifierGroupId(group.id);
    setEditingModifierGroupName(group.name);
    setEditingModifierGroupOptions(group.options.map(opt => ({ ...opt })));
  }

  // Cancel editing
  function cancelEditingModifierGroup() {
    setEditingModifierGroupId(null);
    setEditingModifierGroupName('');
    setEditingModifierGroupOptions([]);
  }

  // Add option to editing modifier group
  function addEditingModifierOption() {
    const newOption = {
      id: `${editingModifierGroupId}_opt_${Date.now()}`,
      label: '',
      priceModifier: 0,
      isDefault: false,
      position: editingModifierGroupOptions.length,
    };
    setEditingModifierGroupOptions([...editingModifierGroupOptions, newOption]);
  }

  // Update option in editing modifier group
  function updateEditingModifierOption(optionId: string, field: 'label' | 'priceModifier' | 'isDefault', value: string | number | boolean) {
    setEditingModifierGroupOptions(
      editingModifierGroupOptions.map(opt =>
        opt.id === optionId
          ? { ...opt, [field]: field === 'priceModifier' ? parseFloat(value as string) || 0 : value }
          : opt
      )
    );
  }

  // Remove option from editing modifier group
  function removeEditingModifierOption(optionId: string) {
    setEditingModifierGroupOptions(editingModifierGroupOptions.filter(opt => opt.id !== optionId));
  }

  // Save edited modifier group (GLOBAL CHANGE)
  async function handleSaveModifierGroupEdit() {
    if (!editingModifierGroupId) return;

    // Validation
    if (!editingModifierGroupName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a modifier group name.',
        variant: 'destructive',
      });
      return;
    }

    if (editingModifierGroupOptions.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one modifier option.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all options have labels
    for (const option of editingModifierGroupOptions) {
      if (!option.label.trim()) {
        toast({
          title: 'Validation Error',
          description: 'All modifier options must have a label.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      // Update the modifier group globally
      const updatedGroup = await updateModifierGroupAPI(editingModifierGroupId, {
        id: editingModifierGroupId,
        name: editingModifierGroupName.trim(),
        type: availableModifierGroups.find(g => g.id === editingModifierGroupId)?.type || 'single',
        required: availableModifierGroups.find(g => g.id === editingModifierGroupId)?.required || false,
        options: editingModifierGroupOptions.map((opt, index) => ({
          ...opt,
          position: index,
        })),
      });

      // Update the local availableModifierGroups state
      setAvailableModifierGroups(
        availableModifierGroups.map(g => g.id === editingModifierGroupId ? updatedGroup : g)
      );

      // Update selectedModifierOptions to reflect new option IDs
      setSelectedModifierOptions(prev => {
        const newOpts = { ...prev };
        if (newOpts[editingModifierGroupId]) {
          // Keep all new options enabled by default
          newOpts[editingModifierGroupId] = new Set(updatedGroup.options.map(opt => opt.id));
        }
        return newOpts;
      });

      // Clear editing state
      cancelEditingModifierGroup();

      toast({
        title: 'Success',
        description: 'Modifier group updated successfully. Changes apply to all items using this modifier.',
      });
    } catch (error) {
      console.error('Failed to update modifier group:', error);
      toast({
        title: 'Error',
        description: 'Failed to update modifier group. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Delete modifier group (GLOBAL DELETE)
  async function handleDeleteModifierGroup(groupId: string) {
    if (!confirm('Are you sure you want to delete this modifier group? This will remove it from ALL menu items.')) {
      return;
    }

    try {
      await deleteModifierGroup(groupId);

      // Remove from available groups
      setAvailableModifierGroups(availableModifierGroups.filter(g => g.id !== groupId));

      // Remove from selected groups
      setSelectedModifierGroupIds(selectedModifierGroupIds.filter(id => id !== groupId));

      // Remove from selected options
      setSelectedModifierOptions(prev => {
        const newOpts = { ...prev };
        delete newOpts[groupId];
        return newOpts;
      });

      toast({
        title: 'Success',
        description: 'Modifier group deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete modifier group:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete modifier group. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a menu item name.',
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category.',
        variant: 'destructive',
      });
      return;
    }

    // Pricing validation based on selected type
    if (pricingType === 'single') {
      if (!basePrice || parseFloat(basePrice) <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid base price.',
          variant: 'destructive',
        });
        return;
      }
    } else if (pricingType === 'legacy') {
      // Legacy Medium/Grande
      if (!mediumPrice || parseFloat(mediumPrice) <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid Medium size price.',
          variant: 'destructive',
        });
        return;
      }
      if (!grandePrice || parseFloat(grandePrice) <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid Grande size price.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // New variants system
      if (variants.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one size variant.',
          variant: 'destructive',
        });
        return;
      }

      // Validate each variant
      for (const variant of variants) {
        if (!variant.name.trim()) {
          toast({
            title: 'Validation Error',
            description: 'All variants must have a name.',
            variant: 'destructive',
          });
          return;
        }
        if (!variant.price || variant.price <= 0) {
          toast({
            title: 'Validation Error',
            description: `Variant "${variant.name}" must have a valid price.`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    try {
      setLoading(true);

      const input: MenuItemInput = {
        categoryId,
        name: name.trim(),
        description: description.trim(),
        // Send price based on pricing type
        // IMPORTANT: Use null (not undefined) to explicitly clear fields for database constraint
        price: pricingType === 'single' ? parseFloat(basePrice) : null,
        priceMedium: pricingType === 'legacy' ? parseFloat(mediumPrice) : null,
        priceGrande: pricingType === 'legacy' ? parseFloat(grandePrice) : null,
        imageUrl: imageUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        position: item?.position || 0,
        isAvailable,
        // Add variants if using new variants system
        variants: pricingType === 'variants' ? variants.map((v, index) => ({
          name: v.name.trim(),
          price: v.price,
          position: index,
        })) : undefined,
        // Add ingredients if any (item-specific)
        ingredients: ingredients.length > 0 ? ingredients.map((ing, index) => ({
          name: ing.name.trim(),
          canExclude: ing.canExclude,
          position: index,
        })) : undefined,
        // Add selected modifier groups
        modifierGroupIds: selectedModifierGroupIds.length > 0 ? selectedModifierGroupIds : undefined,
      };

      console.log('[MENU ITEM FORM] Saving item:', input);

      if (item) {
        const result = await updateMenuItem(item.id, input);
        console.log('[MENU ITEM FORM] Update result:', result);
        toast({
          title: 'Success',
          description: 'Menu item updated successfully.',
        });
      } else {
        const result = await createMenuItem(input);
        console.log('[MENU ITEM FORM] Create result:', result);
        toast({
          title: 'Success',
          description: 'Menu item created successfully.',
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
          <DialogDescription>
            {item
              ? 'Update the menu item details, variants, and modifiers.'
              : 'Create a new menu item with variants and modifiers.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info & Pricing</TabsTrigger>
              <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
              <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
            </TabsList>

            {/* BASIC INFO TAB */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Cappuccino"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this menu item..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unified Pricing Section */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Pricing *</Label>
                  </div>

                  {/* Pricing Type Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pricingType"
                        value="single"
                        checked={pricingType === 'single'}
                        onChange={(e) => setPricingType(e.target.value as 'single' | 'legacy' | 'variants')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Single Price</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pricingType"
                        value="variants"
                        checked={pricingType === 'variants'}
                        onChange={(e) => setPricingType(e.target.value as 'single' | 'legacy' | 'variants')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Multiple Size Variants (Unlimited)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pricingType"
                        value="legacy"
                        checked={pricingType === 'legacy'}
                        onChange={(e) => setPricingType(e.target.value as 'single' | 'legacy' | 'variants')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Legacy M/G Sizes (Medium/Grande only)</span>
                    </label>
                  </div>

                  {/* Dynamic Pricing Inputs */}
                  {pricingType === 'single' ? (
                    <div>
                      <Label htmlFor="basePrice" className="text-sm">Price</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Single price for this item
                      </p>
                    </div>
                  ) : pricingType === 'legacy' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="mediumPrice" className="text-sm">Medium Price</Label>
                        <Input
                          id="mediumPrice"
                          type="number"
                          step="0.01"
                          value={mediumPrice}
                          onChange={(e) => setMediumPrice(e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grandePrice" className="text-sm">Grande Price</Label>
                        <Input
                          id="grandePrice"
                          type="number"
                          step="0.01"
                          value={grandePrice}
                          onChange={(e) => setGrandePrice(e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Size Variants</Label>
                        <Button
                          type="button"
                          onClick={addVariant}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Variant
                        </Button>
                      </div>

                      {variants.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            No size variants yet. Click &quot;Add Variant&quot; to create sizes.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {variants.map((variant) => (
                            <div key={variant.id} className="flex gap-2 items-center">
                              <Input
                                value={variant.name}
                                onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                placeholder="Size name (e.g., Small, Medium, Large)"
                                className="flex-1"
                              />
                              <div className="w-32">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                  placeholder="Price"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariant(variant.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Add as many size variants as you need (e.g., Small, Medium, Large, Extra Large, Personal, etc.)
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL or upload an image in the next step
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Available</Label>
                  <Switch
                    id="available"
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                  />
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag (press Enter)"
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* MODIFIERS TAB - NEW TWO-SECTION DESIGN */}
            <TabsContent value="modifiers" className="space-y-6">
              {/* SECTION 1: Previously Registered Modifiers - COLLAPSIBLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-base">Previously Registered Modifiers</h3>
                    <p className="text-sm text-muted-foreground">
                      Select existing modifier groups that have been created for other items
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowPreviousModifiers(!showPreviousModifiers)}
                    variant={showPreviousModifiers ? "default" : "outline"}
                    size="sm"
                  >
                    {showPreviousModifiers ? 'Hide' : 'Show'} Available Modifiers
                    {availableModifierGroups.length > 0 && ` (${availableModifierGroups.length})`}
                  </Button>
                </div>

                {/* Always show selected modifier groups with EDITABLE BUILDER UI */}
                {selectedModifierGroupIds.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-green-600">
                        ✓ {selectedModifierGroupIds.length} modifier{' '}
                        {selectedModifierGroupIds.length === 1 ? 'group' : 'groups'} selected
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
                        ⚠️ Edits affect ALL items using these modifiers
                      </p>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                      {availableModifierGroups
                        .filter((group) => selectedModifierGroupIds.includes(group.id))
                        .map((group) => {
                          const isEditing = editingModifierGroupId === group.id;
                          const enabledOptions = selectedModifierOptions[group.id] || new Set();

                          return (
                            <div
                              key={group.id}
                              className="border rounded-lg bg-background"
                            >
                              {/* Group Header - EDITABLE */}
                              <div className="flex items-start gap-3 p-3 border-b bg-muted/30">
                                {!isEditing ? (
                                  <>
                                    <Checkbox
                                      id={`modifier-selected-${group.id}`}
                                      checked={true}
                                      onCheckedChange={() => toggleModifierGroupSelection(group.id)}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={`modifier-selected-${group.id}`}
                                        className="font-medium cursor-pointer flex items-center gap-2"
                                      >
                                        {group.name}
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                          {enabledOptions.size} of {group.options.length} enabled
                                        </span>
                                      </Label>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {group.type === 'single' && 'Single selection'}
                                        {group.type === 'multiple' && 'Multiple selection'}
                                        {group.type === 'boolean' && 'Boolean (Yes/No)'}
                                        {group.required && ' • Required'}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startEditingModifierGroup(group)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteModifierGroup(group.id)}
                                      title="Delete modifier (affects all items)"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        value={editingModifierGroupName}
                                        onChange={(e) => setEditingModifierGroupName(e.target.value)}
                                        placeholder="Modifier group name"
                                        className="font-medium"
                                      />
                                      <p className="text-xs text-amber-600 dark:text-amber-400">
                                        ⚠️ Editing this modifier will update it for ALL menu items
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="default"
                                        size="sm"
                                        onClick={handleSaveModifierGroupEdit}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEditingModifierGroup}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Options List - EDITABLE BUILDER STYLE */}
                              <div className="p-3 space-y-2">
                                {!isEditing ? (
                                  <>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                      Select which options to enable for this item:
                                    </p>
                                    {group.options.map((opt) => {
                                      const isOptionEnabled = enabledOptions.has(opt.id);
                                      return (
                                        <div
                                          key={opt.id}
                                          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
                                        >
                                          <Checkbox
                                            id={`option-selected-${group.id}-${opt.id}`}
                                            checked={isOptionEnabled}
                                            onCheckedChange={() => toggleModifierOption(group.id, opt.id)}
                                          />
                                          <Label
                                            htmlFor={`option-selected-${group.id}-${opt.id}`}
                                            className="flex-1 cursor-pointer text-sm flex items-center justify-between"
                                          >
                                            <span className={isOptionEnabled ? 'font-medium' : 'text-muted-foreground'}>
                                              {opt.label}
                                              {opt.isDefault && ' ⭐'}
                                            </span>
                                            {opt.priceModifier !== 0 && (
                                              <span className="text-xs text-muted-foreground">
                                                {opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier.toFixed(2)}
                                              </span>
                                            )}
                                          </Label>
                                        </div>
                                      );
                                    })}
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs font-medium text-muted-foreground">
                                        Modifier Options (Global Edit)
                                      </p>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addEditingModifierOption}
                                      >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Option
                                      </Button>
                                    </div>
                                    {editingModifierGroupOptions.length === 0 ? (
                                      <div className="text-center py-4 border-2 border-dashed rounded-lg">
                                        <p className="text-xs text-muted-foreground">
                                          No options yet. Click &quot;Add Option&quot; to create choices.
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {editingModifierGroupOptions.map((option) => (
                                          <div key={option.id} className="flex gap-2 items-center bg-muted/50 p-2 rounded">
                                            <Input
                                              value={option.label}
                                              onChange={(e) =>
                                                updateEditingModifierOption(option.id, 'label', e.target.value)
                                              }
                                              placeholder="Option name"
                                              className="flex-1"
                                            />
                                            <div className="w-28">
                                              <Input
                                                type="number"
                                                step="0.01"
                                                value={option.priceModifier}
                                                onChange={(e) =>
                                                  updateEditingModifierOption(option.id, 'priceModifier', e.target.value)
                                                }
                                                placeholder="+ Price"
                                              />
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Checkbox
                                                id={`editing-default-${option.id}`}
                                                checked={option.isDefault}
                                                onCheckedChange={(checked) =>
                                                  updateEditingModifierOption(option.id, 'isDefault', checked as boolean)
                                                }
                                              />
                                              <Label htmlFor={`editing-default-${option.id}`} className="text-xs cursor-pointer">
                                                Default
                                              </Label>
                                            </div>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => removeEditingModifierOption(option.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Collapsible section to add MORE modifier groups */}
                {showPreviousModifiers && (
                  <div className="space-y-3 pt-2">
                    {availableModifierGroups.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          No modifier groups available yet. Create your first one below.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                        {availableModifierGroups.map((group) => {
                          const isGroupSelected = selectedModifierGroupIds.includes(group.id);
                          const enabledOptions = selectedModifierOptions[group.id] || new Set();

                          return (
                            <div
                              key={group.id}
                              className="border rounded-lg bg-background"
                            >
                              {/* Group Header */}
                              <div className="flex items-start gap-3 p-3 border-b bg-muted/30">
                                <Checkbox
                                  id={`modifier-${group.id}`}
                                  checked={isGroupSelected}
                                  onCheckedChange={() => toggleModifierGroupSelection(group.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`modifier-${group.id}`}
                                    className="font-medium cursor-pointer flex items-center gap-2"
                                  >
                                    {group.name}
                                    {isGroupSelected && (
                                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                        {enabledOptions.size} of {group.options.length} enabled
                                      </span>
                                    )}
                                  </Label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {group.type === 'single' && 'Single selection'}
                                    {group.type === 'multiple' && 'Multiple selection'}
                                    {group.type === 'boolean' && 'Boolean (Yes/No)'}
                                    {group.required && ' • Required'}
                                  </p>
                                </div>
                              </div>

                              {/* Options List - Only show if group is selected */}
                              {isGroupSelected && (
                                <div className="p-3 space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Select which options to enable for this item:
                                  </p>
                                  {group.options.map((opt) => {
                                    const isOptionEnabled = enabledOptions.has(opt.id);
                                    return (
                                      <div
                                        key={opt.id}
                                        className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
                                      >
                                        <Checkbox
                                          id={`option-${group.id}-${opt.id}`}
                                          checked={isOptionEnabled}
                                          onCheckedChange={() => toggleModifierOption(group.id, opt.id)}
                                        />
                                        <Label
                                          htmlFor={`option-${group.id}-${opt.id}`}
                                          className="flex-1 cursor-pointer text-sm flex items-center justify-between"
                                        >
                                          <span className={isOptionEnabled ? 'font-medium' : 'text-muted-foreground'}>
                                            {opt.label}
                                            {opt.isDefault && ' ⭐'}
                                          </span>
                                          {opt.priceModifier !== 0 && (
                                            <span className="text-xs text-muted-foreground">
                                              {opt.priceModifier > 0 ? '+' : ''}${opt.priceModifier.toFixed(2)}
                                            </span>
                                          )}
                                        </Label>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: Create New Modifier Group */}
              <div className="space-y-3 pt-6 border-t">
                <div>
                  <h3 className="font-semibold text-base">Create New Modifier Group</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new modifier group that can be reused across menu items
                  </p>
                </div>

                <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                  <div>
                    <Label htmlFor="newModGroupName">Group Name *</Label>
                    <Input
                      id="newModGroupName"
                      value={newModifierGroupName}
                      onChange={(e) => setNewModifierGroupName(e.target.value)}
                      placeholder="e.g., Milk Options, Sugar Level, Extras"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newModGroupType">Selection Type *</Label>
                      <Select
                        value={newModifierGroupType}
                        onValueChange={(value) =>
                          setNewModifierGroupType(value as 'single' | 'multiple' | 'boolean')
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single (choose one)</SelectItem>
                          <SelectItem value="multiple">Multiple (choose many)</SelectItem>
                          <SelectItem value="boolean">Boolean (yes/no)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-6">
                      <Label htmlFor="newModGroupRequired">Required</Label>
                      <Switch
                        id="newModGroupRequired"
                        checked={newModifierGroupRequired}
                        onCheckedChange={setNewModifierGroupRequired}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Options *</Label>
                      <Button
                        type="button"
                        onClick={addNewModifierOption}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Option
                      </Button>
                    </div>

                    {newModifierGroupOptions.length === 0 ? (
                      <div className="text-center py-4 border-2 border-dashed rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          No options yet. Click &quot;Add Option&quot; to create choices.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {newModifierGroupOptions.map((option) => (
                          <div key={option.id} className="flex gap-2 items-center">
                            <Input
                              value={option.label}
                              onChange={(e) =>
                                updateNewModifierOption(option.id, 'label', e.target.value)
                              }
                              placeholder="Option name"
                              className="flex-1"
                            />
                            <div className="w-28">
                              <Input
                                type="number"
                                step="0.01"
                                value={option.priceModifier}
                                onChange={(e) =>
                                  updateNewModifierOption(option.id, 'priceModifier', e.target.value)
                                }
                                placeholder="+ Price"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Checkbox
                                id={`default-${option.id}`}
                                checked={option.isDefault}
                                onCheckedChange={(checked) =>
                                  updateNewModifierOption(option.id, 'isDefault', checked as boolean)
                                }
                              />
                              <Label htmlFor={`default-${option.id}`} className="text-xs cursor-pointer">
                                Default
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeNewModifierOption(option.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleCreateNewModifierGroup}
                    className="w-full"
                    variant="default"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create & Assign Modifier Group
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* EXCLUSIONS TAB */}
            <TabsContent value="exclusions" className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Ingredient Exclusions</h3>
                    <p className="text-sm text-muted-foreground">
                      List ingredients that customers can exclude
                    </p>
                  </div>
                  <Button type="button" onClick={addIngredient} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ingredient
                  </Button>
                </div>

                {ingredients.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      No ingredients added yet. Click &quot;Add Ingredient&quot; to list excludable items.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex gap-2 items-center p-3 border rounded-lg"
                      >
                        <Input
                          value={ingredient.name}
                          onChange={(e) =>
                            updateIngredient(ingredient.id, 'name', e.target.value)
                          }
                          placeholder="Ingredient name"
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                          <Label className="text-xs whitespace-nowrap">Can exclude</Label>
                          <Switch
                            checked={ingredient.canExclude}
                            onCheckedChange={(checked) =>
                              updateIngredient(ingredient.id, 'canExclude', checked)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(ingredient.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
