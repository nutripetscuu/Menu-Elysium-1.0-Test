'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createModifierGroup, updateModifierGroup } from '@/lib/actions/modifiers';
import type { ModifierGroup } from '@/lib/api/modifiers';

interface ModifierGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ModifierGroup | null;
  onSuccess: () => void;
}

interface ModifierOption {
  id: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
}

export function ModifierGroupForm({
  open,
  onOpenChange,
  group,
  onSuccess,
}: ModifierGroupFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'single' | 'multiple' | 'boolean'>('single');
  const [required, setRequired] = useState(false);
  const [minSelections, setMinSelections] = useState('0');
  const [maxSelections, setMaxSelections] = useState('');
  const [options, setOptions] = useState<ModifierOption[]>([]);

  // Load group data if editing
  useEffect(() => {
    if (group) {
      setName(group.name);
      setType(group.type);
      setRequired(group.required);
      setMinSelections(group.minSelections.toString());
      setMaxSelections(group.maxSelections?.toString() || '');
      setOptions(group.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        priceModifier: opt.priceModifier,
        isDefault: opt.isDefault,
      })));
    } else {
      resetForm();
    }
  }, [group, open]);

  function resetForm() {
    setName('');
    setType('single');
    setRequired(false);
    setMinSelections('0');
    setMaxSelections('');
    setOptions([]);
  }

  function addOption() {
    setOptions([
      ...options,
      {
        id: crypto.randomUUID(),
        label: '',
        priceModifier: 0,
        isDefault: false,
      },
    ]);
  }

  function updateOption(id: string, field: keyof ModifierOption, value: string | number | boolean) {
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? { ...opt, [field]: field === 'priceModifier' ? parseFloat(value as string) || 0 : value }
          : opt
      )
    );
  }

  function removeOption(id: string) {
    setOptions(options.filter((opt) => opt.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a modifier group name.',
        variant: 'destructive',
      });
      return;
    }

    if (options.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one modifier option.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all options have labels
    for (const option of options) {
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
      setLoading(true);

      if (group) {
        // Update existing group
        await updateModifierGroup(group.id, {
          id: group.id,
          name: name.trim(),
          type,
          required,
          minSelections: parseInt(minSelections) || 0,
          maxSelections: maxSelections ? parseInt(maxSelections) : null,
          options: options.map((opt, index) => ({
            id: opt.id,
            label: opt.label.trim(),
            priceModifier: opt.priceModifier,
            isDefault: opt.isDefault,
            position: index,
          })),
        });

        toast({
          title: 'Success',
          description: 'Modifier group updated successfully.',
        });
      } else {
        // Create new group
        const groupId = `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

        await createModifierGroup({
          id: groupId,
          name: name.trim(),
          type,
          required,
          minSelections: parseInt(minSelections) || 0,
          maxSelections: maxSelections ? parseInt(maxSelections) : null,
          options: options.map((opt, index) => ({
            id: `${groupId}_opt_${index}`,
            label: opt.label.trim(),
            priceModifier: opt.priceModifier,
            isDefault: opt.isDefault,
            position: index,
          })),
        });

        toast({
          title: 'Success',
          description: 'Modifier group created successfully.',
        });
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving modifier group:', error);
      toast({
        title: 'Error',
        description: 'Failed to save modifier group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group ? 'Edit Modifier Group' : 'Add Modifier Group'}</DialogTitle>
          <DialogDescription>
            {group
              ? 'Update the modifier group details and options.'
              : 'Create a new modifier group that can be applied to menu items.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Milk Options, Sugar Level, Extras"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Selection Type *</Label>
                <Select value={type} onValueChange={(value) => setType(value as any)}>
                  <SelectTrigger id="type">
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
                <Label htmlFor="required">Required</Label>
                <Switch
                  id="required"
                  checked={required}
                  onCheckedChange={setRequired}
                />
              </div>
            </div>

            {/* Selection Limits */}
            {type === 'multiple' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minSelections">Min Selections</Label>
                  <Input
                    id="minSelections"
                    type="number"
                    min="0"
                    value={minSelections}
                    onChange={(e) => setMinSelections(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSelections">Max Selections (optional)</Label>
                  <Input
                    id="maxSelections"
                    type="number"
                    min="1"
                    value={maxSelections}
                    onChange={(e) => setMaxSelections(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Options *</Label>
              <Button
                type="button"
                onClick={addOption}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Option
              </Button>
            </div>

            {options.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No options yet. Click &quot;Add Option&quot; to create choices.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {options.map((option) => (
                  <div key={option.id} className="flex gap-2 items-center p-3 border rounded-lg bg-muted/30">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                      placeholder="Option name"
                      className="flex-1"
                    />
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        value={option.priceModifier}
                        onChange={(e) => updateOption(option.id, 'priceModifier', e.target.value)}
                        placeholder="+ Price"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`default-${option.id}`}
                        checked={option.isDefault}
                        onCheckedChange={(checked) => updateOption(option.id, 'isDefault', checked as boolean)}
                      />
                      <Label htmlFor={`default-${option.id}`} className="text-xs cursor-pointer whitespace-nowrap">
                        Default
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              {loading ? 'Saving...' : group ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
