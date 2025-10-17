'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getAllModifierGroups, deleteModifierGroup } from '@/lib/actions/modifiers';
import type { ModifierGroup } from '@/lib/api/modifiers';
import { ModifierGroupForm } from '@/components/admin/modifier-group-form';

export default function ModifiersPage() {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<ModifierGroup | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<ModifierGroup | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load modifier groups
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const groups = await getAllModifierGroups();
      setModifierGroups(groups);
    } catch (error) {
      console.error('Error loading modifier groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load modifier groups. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  // Filter modifier groups based on search
  const filteredGroups = modifierGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete
  async function handleDelete() {
    if (!groupToDelete) return;

    try {
      await deleteModifierGroup(groupToDelete.id);
      setModifierGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      toast({
        title: 'Success',
        description: `${groupToDelete.name} has been deleted.`,
      });
      setGroupToDelete(null);
    } catch (error) {
      console.error('Error deleting modifier group:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete modifier group. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Toggle expanded state for a group
  function toggleGroup(groupId: string) {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading modifier groups...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between xl:pr-[432px]">
        <div>
          <h1 className="text-3xl font-bold">Modifiers</h1>
          <p className="text-muted-foreground">
            Manage customization options for menu items
          </p>
        </div>
        <Button onClick={() => { setGroupToEdit(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Modifier Group
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search modifier groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Modifier Groups List */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {searchQuery
              ? 'No modifier groups found matching your search.'
              : 'No modifier groups yet. Add your first modifier group to get started.'}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => { setGroupToEdit(null); setFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Modifier Group
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            return (
              <div
                key={group.id}
                className="border rounded-lg bg-card hover:shadow-md transition-all"
              >
                {/* Group Header */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex-shrink-0 hover:bg-muted p-1 rounded transition-colors"
                  >
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isExpanded ? '' : '-rotate-90'
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {group.options.length} {group.options.length === 1 ? 'option' : 'options'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>
                        {group.type === 'single' && 'Single selection'}
                        {group.type === 'multiple' && 'Multiple selection'}
                        {group.type === 'boolean' && 'Boolean (Yes/No)'}
                      </span>
                      {group.required && (
                        <span className="text-amber-600 dark:text-amber-400">• Required</span>
                      )}
                      {group.minSelections > 0 && (
                        <span>• Min: {group.minSelections}</span>
                      )}
                      {group.maxSelections && (
                        <span>• Max: {group.maxSelections}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToEdit(group);
                        setFormOpen(true);
                      }}
                      title="Edit modifier group"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(group);
                      }}
                      title="Delete modifier group"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Options List */}
                {isExpanded && (
                  <div className="border-t px-4 py-3 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      MODIFIER OPTIONS:
                    </p>
                    <div className="space-y-2">
                      {group.options.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No options available</p>
                      ) : (
                        group.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-2 bg-background rounded border"
                          >
                            <span className="text-sm font-medium">
                              {option.label}
                              {option.isDefault && ' ⭐'}
                            </span>
                            {option.priceModifier !== 0 && (
                              <span className="text-sm text-muted-foreground">
                                {option.priceModifier > 0 ? '+' : ''}${option.priceModifier.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Modifier Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{groupToDelete?.name}&quot;? This will remove it from all menu items. This action cannot be undone.
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

      {/* Modifier Group Form */}
      <ModifierGroupForm
        open={formOpen}
        onOpenChange={setFormOpen}
        group={groupToEdit}
        onSuccess={loadData}
      />
    </div>
  );
}
