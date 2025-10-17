'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from './image-upload';
import { toast } from 'sonner';
import { createPromotion, updatePromotion } from '@/lib/actions/promotions';
import type { PromotionalImage } from '@/lib/api/promotions';

interface PromotionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: PromotionalImage | null;
  onSuccess: () => void;
}

export function PromotionForm({
  open,
  onOpenChange,
  promotion,
  onSuccess
}: PromotionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    link_url: '',
    is_active: true,
    start_date: '',
    end_date: ''
  });

  // Load promotion data when editing
  useEffect(() => {
    if (promotion) {
      setFormData({
        image_url: promotion.image_url || '',
        title: promotion.title || '',
        description: promotion.description || '',
        link_url: promotion.link_url || '',
        is_active: promotion.is_active,
        start_date: promotion.start_date ? promotion.start_date.split('T')[0] : '',
        end_date: promotion.end_date ? promotion.end_date.split('T')[0] : ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        image_url: '',
        title: '',
        description: '',
        link_url: '',
        is_active: true,
        start_date: '',
        end_date: ''
      });
    }
  }, [promotion, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.image_url) {
      toast.error('Please upload an image');
      return;
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        toast.error('End date must be after start date');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare data
      const data = {
        image_url: formData.image_url,
        title: formData.title || undefined,
        description: formData.description || undefined,
        link_url: formData.link_url || undefined,
        is_active: formData.is_active,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined
      };

      let response;

      if (promotion) {
        // Update existing
        response = await updatePromotion(promotion.id, data);
      } else {
        // Create new
        response = await createPromotion(data);
      }

      if (!response.success) {
        throw new Error(response.error || 'Operation failed');
      }

      toast.success(promotion ? 'Promotion updated successfully' : 'Promotion created successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promotion ? 'Edit Promotion' : 'Add New Promotion'}
          </DialogTitle>
          <DialogDescription>
            {promotion
              ? 'Update the promotional banner details'
              : 'Upload a new promotional banner for the homepage carousel'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label>Image *</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Recommended size: 1920x600px
            </p>
            <ImageUpload
              currentImageUrl={formData.image_url}
              onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
            />
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Summer Special"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Displayed as overlay text on the image
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Get 20% off all cold drinks"
              rows={2}
            />
          </div>

          {/* Link URL */}
          <div>
            <Label htmlFor="link_url">Link URL (Optional)</Label>
            <Input
              id="link_url"
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              placeholder="https://example.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              External link when users click the banner
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this promotion on the homepage
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date (Optional)</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                min={formData.start_date}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty to show indefinitely
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                promotion ? 'Update Promotion' : 'Create Promotion'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
