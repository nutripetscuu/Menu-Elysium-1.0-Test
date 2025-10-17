# Live Menu Preview Implementation

## Overview

The admin panel now includes a **live mobile preview** that displays real-time changes to the menu as you edit categories, menu items, modifiers, and other content.

## Features

✅ **Always Visible** - Fixed preview panel on the right side of the admin interface (visible on xl screens and above)
✅ **Mobile Phone Frame** - Realistic iPhone-style preview showing exactly how customers will see your menu
✅ **Real-time Updates** - Preview automatically refreshes when you make changes
✅ **Manual Refresh** - Refresh button to manually reload the preview
✅ **Open in New Tab** - External link button to view the full menu in a new browser tab
✅ **Responsive** - Preview is hidden on smaller screens to maintain admin panel usability

## How It Works

### Architecture

1. **LiveMenuPreview Component** (`src/components/admin/live-menu-preview.tsx`)
   - Displays an iframe with the live menu in a phone frame
   - Shows loading states and provides refresh controls
   - Fixed positioning on the right side of the screen

2. **LivePreviewContext** (`src/lib/contexts/live-preview-context.tsx`)
   - React Context that manages preview refresh state
   - Provides `refreshPreview()` function to trigger updates

3. **useRefreshPreview Hook** (`src/lib/hooks/use-refresh-preview.ts`)
   - Convenient hook for components to trigger preview refreshes
   - Includes a 500ms delay to allow database changes to propagate

### Integration in Admin Layout

The preview is integrated at the layout level so it appears on all admin pages:

```tsx
<AdminLayout>
  <LivePreviewProvider>
    <AdminLayoutContent>
      {/* Your admin page content */}
    </AdminLayoutContent>
    <LiveMenuPreview />
  </LivePreviewProvider>
</AdminLayout>
```

## Usage in Admin Components

To refresh the preview after making changes, use the `useRefreshPreview` hook:

```tsx
"use client";

import { useRefreshPreview } from '@/lib/hooks/use-refresh-preview';

export function YourAdminComponent() {
  const refreshPreview = useRefreshPreview();

  const handleSaveCategory = async (data) => {
    // Save your changes to the database
    await saveCategory(data);

    // Refresh the live preview
    refreshPreview();
  };

  return (
    // Your component JSX
  );
}
```

### When to Trigger Refresh

Trigger a preview refresh after:
- ✅ Creating, updating, or deleting categories
- ✅ Creating, updating, or deleting menu items
- ✅ Modifying menu item prices or descriptions
- ✅ Changing item availability
- ✅ Updating promotional content
- ✅ Modifying modifiers or variants
- ✅ Any other change that affects the customer-facing menu

### Example Implementation

Here's a complete example of integrating preview refresh into a form:

```tsx
"use client";

import { useState } from 'react';
import { useRefreshPreview } from '@/lib/hooks/use-refresh-preview';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export function CategoryForm() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const refreshPreview = useRefreshPreview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save to database
      const { error } = await supabase
        .from('categories')
        .insert({ name, is_active: true });

      if (error) throw error;

      // Success! Refresh the preview
      refreshPreview();

      // Reset form
      setName('');
      alert('Category created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
      />
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Create Category'}
      </Button>
    </form>
  );
}
```

## Preview Behavior

### Automatic Refresh
- Preview refreshes when `refreshPreview()` is called
- 500ms delay allows database changes to propagate
- Loading indicator shows during refresh

### Manual Controls
- **Refresh Button**: Click to manually reload the preview
- **External Link Button**: Opens the menu in a new browser tab
- **"View Public Menu" Link**: Still available in the sidebar for full-page view

### Responsive Design
- **xl screens and larger**: Preview is visible and fixed on the right
- **Smaller screens**: Preview is hidden, admin panel uses full width
- **Content spacing**: Admin content automatically adjusts to avoid overlap

## Technical Details

### Layout Adjustments
The admin content container adjusts its padding on large screens to prevent overlap:

```tsx
<div className="container mx-auto p-6 xl:pr-[420px]">
  {children}
</div>
```

### Preview Dimensions
- **Width**: 380px (fixed)
- **Phone frame**: ~320px (responsive within container)
- **Position**: Fixed, right side, top: 80px, bottom: 24px

### iframe Security
The preview uses an iframe with sandbox attributes for security:
- `allow-same-origin`: Required for Supabase auth
- `allow-scripts`: Required for React functionality
- `allow-forms`: Required for interactive elements

## Troubleshooting

### Preview not updating?
1. Check browser console for errors
2. Try manual refresh button
3. Verify database changes were saved successfully
4. Allow a few seconds for changes to propagate

### Preview not visible?
1. Ensure you're on a screen width of 1280px or wider (xl breakpoint)
2. Check browser zoom level (should be 100%)
3. Verify the preview component is mounted in the layout

### Performance concerns?
The iframe is only loaded once and refreshed on demand. If you notice performance issues:
1. Reduce frequency of `refreshPreview()` calls
2. Consider debouncing rapid successive calls
3. Use the manual refresh button instead of automatic refresh

## Future Enhancements

Potential improvements for the future:
- [ ] Add preview size options (different phone models)
- [ ] Enable preview for tablet and desktop views
- [ ] Add side-by-side comparison mode
- [ ] Implement preview history/undo
- [ ] Add screenshot capability
- [ ] Enable preview for specific pages (categories, items)
