'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CategoryFormModal } from '@/components/admin/categories/category-form-modal';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/actions/categories';
import type { Category } from '@/lib/api/categories';
import * as Icons from 'lucide-react';

interface SortableItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function SortableItem({ category, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Dynamically get the icon component
  const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card p-4 hover:shadow-md transition-all"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Icon */}
      <div className="rounded-lg bg-primary/10 p-2">
        <IconComponent className="h-5 w-5 text-primary" />
      </div>

      {/* Category Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{category.name}</h3>
          {!category.isActive && (
            <Badge variant="outline" className="text-muted-foreground">
              <EyeOff className="mr-1 h-3 w-3" />
              Hidden
            </Badge>
          )}
          {category.isActive && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Eye className="mr-1 h-3 w-3" />
              Active
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Position: {category.position} • Icon: {category.icon}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(category)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(category)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);

    // Update positions in database
    try {
      const categoryIds = newCategories.map((cat) => cat.id);
      await reorderCategories(categoryIds);
    } catch (err) {
      setError('Failed to save new order. Please refresh the page.');
      // Revert to original order
      loadCategories();
    }
  };

  // Handle create/edit
  const handleFormSubmit = async (data: {
    name: string;
    icon: string;
    position: number;
    isActive: boolean;
  }) => {
    if (editingCategory) {
      // Update existing
      await updateCategory(editingCategory.id, data);
    } else {
      // Create new
      await createCategory(data);
    }
    await loadCategories();
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      await loadCategories();
      setDeletingCategory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      setDeletingCategory(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between xl:pr-[432px]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Categories</h1>
          <p className="text-muted-foreground">
            Manage your menu categories and their display order
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Drag and drop to reorder. Categories appear in this order on the public menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No categories yet</p>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Category
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories.map((cat) => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {categories.map((category) => (
                    <SortableItem
                      key={category.id}
                      category={category}
                      onEdit={(cat) => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      onDelete={(cat) => setDeletingCategory(cat)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        nextPosition={categories.length}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;?
              This will also delete all menu items in this category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
