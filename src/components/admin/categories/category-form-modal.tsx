'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Category } from '@/lib/types/database';
import { IconSelect } from './icon-select';

// Form validation schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name is too long'),
  icon: z.string().min(1, 'Icon name is required'),
  position: z.number().int().min(0, 'Position must be 0 or greater'),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  category?: Category | null;
  nextPosition: number;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  nextPosition,
}: CategoryFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      icon: '',
      position: nextPosition,
      isActive: true,
    },
  });

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          icon: category.icon,
          position: category.position,
          isActive: category.isActive,
        });
      } else {
        reset({
          name: '',
          icon: '',
          position: nextPosition,
          isActive: true,
        });
      }
      setError('');
    }
  }, [isOpen, category, nextPosition, reset]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    setError('');

    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const isActive = watch('isActive');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the category details below.'
              : 'Create a new menu category. Categories organize your menu items.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g., Calientes, Frappés, Frescos"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <IconSelect
            value={watch('icon')}
            onChange={(iconName) => setValue('icon', iconName)}
            disabled={loading}
          />
          {errors.icon && (
            <p className="text-sm text-destructive">{errors.icon.message}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="position">Display Order</Label>
            <Input
              id="position"
              type="number"
              min="0"
              {...register('position', { valueAsNumber: true })}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first. You can also drag to reorder.
            </p>
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">
                Active
              </Label>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? 'Category is visible on the public menu'
                  : 'Category is hidden from customers'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : isEdit ? (
                'Update Category'
              ) : (
                'Create Category'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
