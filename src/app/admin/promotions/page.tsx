'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { PromotionForm } from '@/components/admin/promotion-form';
import {
  getAllPromotions,
  deletePromotion,
  togglePromotionStatus,
  reorderPromotions
} from '@/lib/actions/promotions';
import type { PromotionalImage } from '@/lib/api/promotions';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionalImage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<PromotionalImage | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Load promotions
  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await getAllPromotions();

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load promotions');
      }

      setPromotions(response.data);
    } catch (error) {
      console.error('Load error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // Handle create
  const handleCreate = () => {
    setEditingPromotion(null);
    setFormOpen(true);
  };

  // Handle edit
  const handleEdit = (promotion: PromotionalImage) => {
    setEditingPromotion(promotion);
    setFormOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (promotion: PromotionalImage) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!promotionToDelete) return;

    try {
      const response = await deletePromotion(promotionToDelete.id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete');
      }

      toast.success('Promotion deleted successfully');
      loadPromotions();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete promotion');
    } finally {
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  // Handle toggle active status
  const handleToggleStatus = async (promotion: PromotionalImage) => {
    try {
      const response = await togglePromotionStatus(promotion.id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to toggle status');
      }

      toast.success(`Promotion ${response.data?.is_active ? 'activated' : 'deactivated'}`);
      loadPromotions();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle status');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, promotionId: string) => {
    setDraggedItem(promotionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    // Reorder promotions
    const newPromotions = [...promotions];
    const draggedIndex = newPromotions.findIndex(p => p.id === draggedItem);
    const targetIndex = newPromotions.findIndex(p => p.id === targetId);

    const [removed] = newPromotions.splice(draggedIndex, 1);
    newPromotions.splice(targetIndex, 0, removed);

    // Update local state immediately for smooth UX
    setPromotions(newPromotions);
    setDraggedItem(null);

    // Save new order to database
    try {
      const promotionIds = newPromotions.map(p => p.id);
      const response = await reorderPromotions(promotionIds);

      if (!response.success) {
        throw new Error(response.error || 'Failed to reorder');
      }

      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reorder promotions');
      // Reload to get correct order from database
      loadPromotions();
    }
  };

  // Format date
  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotional Images</h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage carousel banners
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Promotion
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && promotions.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Image
            src="/placeholder-image.svg"
            alt="No promotions"
            width={120}
            height={120}
            className="mx-auto mb-4 opacity-50"
            unoptimized
          />
          <h3 className="text-lg font-semibold mb-2">No promotions yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding your first promotional banner
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Promotion
          </Button>
        </div>
      )}

      {/* Promotions Grid */}
      {!loading && promotions.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Drag items to reorder • Lower positions appear first in carousel
          </p>

          <div className="grid gap-4">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                draggable
                onDragStart={(e) => handleDragStart(e, promotion.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, promotion.id)}
                className={`
                  border rounded-lg p-4 transition-all
                  ${draggedItem === promotion.id ? 'opacity-50 scale-95' : ''}
                  ${!promotion.is_active ? 'bg-muted/50' : 'bg-card'}
                  hover:shadow-md cursor-move
                `}
              >
                <div className="flex gap-4">
                  {/* Drag Handle */}
                  <div className="flex items-center">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Image Preview */}
                  <div className="relative w-48 h-32 flex-shrink-0 rounded overflow-hidden border">
                    <Image
                      src={promotion.image_url}
                      alt={promotion.title || 'Promotion'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {promotion.title || 'Untitled Promotion'}
                          </h3>
                          <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                            {promotion.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            Position {promotion.position}
                          </Badge>
                        </div>

                        {promotion.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {promotion.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {promotion.link_url && (
                            <div>
                              Link: <span className="text-foreground">{promotion.link_url}</span>
                            </div>
                          )}
                          {(promotion.start_date || promotion.end_date) && (
                            <div>
                              Schedule: <span className="text-foreground">
                                {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(promotion)}
                          title={promotion.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {promotion.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(promotion)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(promotion)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promotion Form Modal */}
      <PromotionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        promotion={editingPromotion}
        onSuccess={loadPromotions}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{promotionToDelete?.title || 'this promotion'}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
