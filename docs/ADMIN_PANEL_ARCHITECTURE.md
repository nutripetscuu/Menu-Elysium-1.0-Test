# Elysium Restaurant Admin Panel - Complete Architecture Design
*Generated: 2025-10-08*

---

## Executive Summary

This document provides a comprehensive architecture design for the Elysium Restaurant Admin Panel (CMS). The admin panel will enable restaurant owners to manage their menu system through a self-service interface, supporting CRUD operations for categories, items, modifiers, promotions, and settings.

### Key Design Principles
- **Same Tech Stack**: Uses existing Next.js 15, React 18, TypeScript, Tailwind, Shadcn/ui
- **Zero Breaking Changes**: Works with existing database schema (with planned enhancements)
- **Real-time Updates**: Changes reflect immediately on public menu via Supabase
- **Security First**: Supabase Auth + RLS policies for access control
- **Mobile-Friendly**: Responsive admin interface for tablet/phone management

---

## Table of Contents

1. [Tech Stack Analysis](#1-tech-stack-analysis)
2. [Folder Structure](#2-folder-structure)
3. [Authentication System](#3-authentication-system)
4. [Component Architecture](#4-component-architecture)
5. [API Routes & Data Layer](#5-api-routes--data-layer)
6. [Visual Editor Architecture](#6-visual-editor-architecture)
7. [Image Upload System](#7-image-upload-system)
8. [Row Level Security (RLS) Policies](#8-row-level-security-rls-policies)
9. [Real-time Data Sync](#9-real-time-data-sync)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Tech Stack Analysis

### Existing Frontend Stack (✅ Verified)

```json
{
  "framework": "Next.js 15.5.3 (App Router)",
  "runtime": "React 18.3.1",
  "language": "TypeScript 5.9.3 (strict mode)",
  "styling": "Tailwind CSS 3.4.1 + tailwindcss-animate",
  "components": "Shadcn/ui (Radix UI primitives)",
  "database": "Supabase (PostgreSQL)",
  "auth": "Supabase Auth (ready, not implemented)",
  "storage": "Supabase Storage (ready, not implemented)",
  "forms": "React Hook Form 7.54.2 + Zod 3.24.2",
  "icons": "Lucide React 0.475.0",
  "state": "React Context + useState (no Redux/Zustand yet)"
}
```

### Key Libraries Available

**UI Components:**
- ✅ All Shadcn/ui components installed (dialog, form, table, tabs, etc.)
- ✅ Alert dialogs, toasts, dropdowns
- ✅ Drag-and-drop ready (can add `@dnd-kit/core` if needed)

**Form Handling:**
- ✅ React Hook Form (already in use)
- ✅ Zod validation (already in use)
- ✅ `@hookform/resolvers` for Zod integration

**Data Fetching:**
- ✅ Supabase JS client configured
- ✅ API abstraction layer in `src/lib/api/`
- ✅ TypeScript types from database schema

**Additional:**
- ✅ Date handling: `date-fns 3.6.0`
- ✅ Charts: `recharts 2.15.1` (for analytics)
- ✅ Carousel: `embla-carousel-react 8.6.0`

### Admin Panel Dependencies (New Additions Needed)

```bash
# Image upload & cropping
npm install react-dropzone
npm install react-image-crop

# Rich text editor (for descriptions)
npm install @tiptap/react @tiptap/starter-kit

# Drag-and-drop (for reordering)
npm install @dnd-kit/core @dnd-kit/sortable

# Color picker (for branding)
npm install react-colorful
```

---

## 2. Folder Structure

### Complete Admin Panel Structure

```
src/
├── app/
│   ├── (public)/                   # Public-facing pages
│   │   ├── layout.tsx              # Existing public layout
│   │   ├── page.tsx                # Existing menu page
│   │   └── ...
│   │
│   ├── (admin)/                    # 🆕 Admin panel routes (protected)
│   │   ├── layout.tsx              # Admin layout with sidebar/nav
│   │   ├── login/                  # Authentication
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/                  # Admin routes (protected)
│   │   │   ├── layout.tsx          # Nested admin layout
│   │   │   │
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── categories/         # Category management
│   │   │   │   ├── page.tsx        # List view
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Create category
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Edit category
│   │   │   │
│   │   │   ├── menu-items/         # Menu item management
│   │   │   │   ├── page.tsx        # List view with filters
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Create item
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Edit item (full form)
│   │   │   │       └── quick-edit/
│   │   │   │           └── page.tsx # Quick availability toggle
│   │   │   │
│   │   │   ├── modifiers/          # Modifier group management
│   │   │   │   ├── page.tsx        # List all modifier groups
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # Create modifier group
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Edit group + options
│   │   │   │
│   │   │   ├── promotions/         # Promotional images
│   │   │   │   ├── page.tsx        # Manage carousel images
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx    # Upload new image
│   │   │   │
│   │   │   ├── settings/           # Restaurant settings
│   │   │   │   ├── page.tsx        # General settings
│   │   │   │   ├── branding/
│   │   │   │   │   └── page.tsx    # Logo, colors
│   │   │   │   └── business/
│   │   │   │       └── page.tsx    # Hours, contact
│   │   │   │
│   │   │   ├── visual-editor/      # 🌟 Visual menu editor
│   │   │   │   └── page.tsx        # Inline editing preview
│   │   │   │
│   │   │   └── users/              # Admin user management
│   │   │       ├── page.tsx        # List admins
│   │   │       └── invite/
│   │   │           └── page.tsx    # Invite new admin
│   │   │
│   │   └── api/                    # 🆕 Admin API routes
│   │       ├── auth/               # Auth endpoints
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   └── session/
│   │       │       └── route.ts
│   │       │
│   │       ├── categories/         # Category CRUD
│   │       │   ├── route.ts        # GET (list), POST (create)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts    # GET, PATCH, DELETE
│   │       │   └── reorder/
│   │       │       └── route.ts    # PATCH (bulk position update)
│   │       │
│   │       ├── menu-items/         # Menu item CRUD
│   │       │   ├── route.ts        # GET (list), POST (create)
│   │       │   ├── [id]/
│   │       │   │   └── route.ts    # GET, PATCH, DELETE
│   │       │   └── bulk-availability/
│   │       │       └── route.ts    # PATCH (toggle multiple)
│   │       │
│   │       ├── modifiers/          # Modifier group CRUD
│   │       │   ├── route.ts        # GET, POST
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET, PATCH, DELETE
│   │       │
│   │       ├── modifier-options/   # Modifier option CRUD
│   │       │   ├── route.ts        # GET, POST
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET, PATCH, DELETE
│   │       │
│   │       ├── promotions/         # Promotional images
│   │       │   ├── route.ts        # GET, POST
│   │       │   └── [id]/
│   │       │       └── route.ts    # DELETE
│   │       │
│   │       ├── settings/           # Settings CRUD
│   │       │   ├── route.ts        # GET (all), PATCH (update)
│   │       │   └── [key]/
│   │       │       └── route.ts    # GET, PATCH
│   │       │
│   │       └── upload/             # File upload
│   │           ├── menu-image/
│   │           │   └── route.ts    # POST (upload menu item image)
│   │           ├── promo-image/
│   │           │   └── route.ts    # POST (upload promo image)
│   │           └── logo/
│   │               └── route.ts    # POST (upload logo)
│   │
│   └── middleware.ts               # 🆕 Route protection middleware
│
├── components/
│   ├── (public)/                   # Existing public components
│   │   ├── layout/
│   │   ├── menu-section.tsx
│   │   ├── category-nav.tsx
│   │   ├── product-modal.tsx
│   │   └── ...
│   │
│   ├── admin/                      # 🆕 Admin-specific components
│   │   ├── layout/
│   │   │   ├── admin-header.tsx    # Admin top nav with user menu
│   │   │   ├── admin-sidebar.tsx   # Left sidebar navigation
│   │   │   └── admin-breadcrumb.tsx # Breadcrumb trail
│   │   │
│   │   ├── categories/
│   │   │   ├── category-list.tsx   # Table of categories
│   │   │   ├── category-form.tsx   # Create/edit form
│   │   │   └── category-card.tsx   # Card view (optional)
│   │   │
│   │   ├── menu-items/
│   │   │   ├── menu-item-list.tsx       # Table with filters
│   │   │   ├── menu-item-form.tsx       # Full item form
│   │   │   ├── menu-item-card.tsx       # Card view
│   │   │   ├── variant-input.tsx        # Price variants input
│   │   │   ├── modifier-selector.tsx    # Attach modifiers
│   │   │   └── availability-toggle.tsx  # Quick toggle
│   │   │
│   │   ├── modifiers/
│   │   │   ├── modifier-group-list.tsx   # List all groups
│   │   │   ├── modifier-group-form.tsx   # Group form
│   │   │   ├── modifier-option-list.tsx  # Options within group
│   │   │   └── modifier-option-form.tsx  # Option form
│   │   │
│   │   ├── promotions/
│   │   │   ├── promo-image-grid.tsx      # Image grid
│   │   │   ├── promo-image-upload.tsx    # Upload component
│   │   │   └── promo-image-card.tsx      # Single image card
│   │   │
│   │   ├── settings/
│   │   │   ├── general-settings-form.tsx  # WhatsApp, etc.
│   │   │   ├── branding-form.tsx          # Logo, colors
│   │   │   └── business-hours-form.tsx    # Operating hours
│   │   │
│   │   ├── visual-editor/
│   │   │   ├── visual-menu-preview.tsx    # Live menu preview
│   │   │   ├── inline-editor.tsx          # Contenteditable overlay
│   │   │   └── editor-toolbar.tsx         # Edit mode controls
│   │   │
│   │   └── shared/
│   │       ├── image-upload.tsx          # Reusable upload
│   │       ├── image-cropper.tsx         # Crop modal
│   │       ├── rich-text-editor.tsx      # WYSIWYG editor
│   │       ├── color-picker.tsx          # Color selector
│   │       ├── confirm-dialog.tsx        # Delete confirmation
│   │       └── data-table.tsx            # Reusable table
│   │
│   └── ui/                         # Existing Shadcn components
│       └── ...
│
├── lib/
│   ├── api/
│   │   ├── menu.ts                 # Existing menu API
│   │   ├── header-images.ts        # Existing promo API
│   │   │
│   │   └── admin/                  # 🆕 Admin API layer
│   │       ├── categories.ts       # Category operations
│   │       ├── menu-items.ts       # Menu item operations
│   │       ├── modifiers.ts        # Modifier operations
│   │       ├── promotions.ts       # Promotion operations
│   │       ├── settings.ts         # Settings operations
│   │       └── upload.ts           # File upload helper
│   │
│   ├── supabase/
│   │   ├── client.ts               # Existing client (public)
│   │   ├── admin-client.ts         # 🆕 Admin client (authenticated)
│   │   └── middleware.ts           # 🆕 Auth middleware helper
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts           # Existing mobile detection
│   │   │
│   │   └── admin/                  # 🆕 Admin hooks
│   │       ├── use-auth.ts         # Auth state & login/logout
│   │       ├── use-categories.ts   # Category CRUD hooks
│   │       ├── use-menu-items.ts   # Menu item CRUD hooks
│   │       ├── use-modifiers.ts    # Modifier CRUD hooks
│   │       ├── use-promotions.ts   # Promotion CRUD hooks
│   │       ├── use-settings.ts     # Settings hooks
│   │       └── use-upload.ts       # File upload hook
│   │
│   └── types/
│       ├── database.ts             # Existing DB types
│       └── admin.ts                # 🆕 Admin-specific types
│
├── middleware.ts                   # 🆕 Next.js middleware (auth)
│
└── .env.local                      # Environment variables
```

### Key Design Decisions

**1. Route Groups:**
- `(public)` - Customer-facing menu (existing)
- `(admin)` - Admin panel (new, protected)
- Keeps public and admin routes cleanly separated

**2. API Routes:**
- All admin operations go through `/api/` endpoints
- Server-side validation and auth checks
- Type-safe with Zod schemas

**3. Component Organization:**
- `components/admin/` - Admin-specific UI
- `components/ui/` - Shared Shadcn components
- Feature-based folders (categories, menu-items, etc.)

---

## 3. Authentication System

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Admin visits   │
│  /admin/*       │
└────────┬────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│       Next.js Middleware (middleware.ts)   │
│  - Check if route requires auth            │
│  - Read Supabase session from cookie       │
└────────┬───────────────────────────────────┘
         │
         ├─── Not Authenticated ──→ Redirect to /login
         │
         └─── Authenticated ───┐
                               ↓
                    ┌──────────────────────┐
                    │ Verify admin_users   │
                    │ Check role in DB     │
                    └──────────┬───────────┘
                               │
                               ├─── Not admin ──→ Redirect to /login
                               │
                               └─── Is admin ───┐
                                                 ↓
                                      ┌──────────────────┐
                                      │  Allow access    │
                                      │  to admin panel  │
                                      └──────────────────┘
```

### Supabase Auth Setup

**1. Authentication Method:**
- **Email + Password** (primary)
- **Magic Link** (optional, email-based)
- **No social login** (not needed for restaurant staff)

**2. User Flow:**

```typescript
// 1. Admin signs in
await supabase.auth.signInWithPassword({
  email: 'admin@elysium.com',
  password: 'secure-password'
})

// 2. Supabase returns JWT token
// 3. Check if user exists in admin_users table
const { data: adminUser } = await supabase
  .from('admin_users')
  .select('*')
  .eq('id', user.id)
  .single()

// 4. If adminUser exists → allow access
// 5. If not → deny access (user not authorized as admin)
```

### Implementation Files

#### **`middleware.ts`** - Route Protection

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // Not logged in → redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!adminUser) {
      // User exists but not in admin_users → deny
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // Update last_login timestamp
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', session.user.id)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

#### **`src/lib/hooks/admin/use-auth.ts`** - Auth Hook

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/admin-client'
import type { User } from '@supabase/supabase-js'
import type { AdminUser } from '@/lib/types/admin'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadAdminUser(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadAdminUser(session.user.id)
        } else {
          setAdminUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadAdminUser = async (userId: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()

    setAdminUser(data)
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    adminUser,
    loading,
    signIn,
    signOut,
    isAdmin: !!adminUser,
    role: adminUser?.role,
  }
}
```

#### **`src/app/(admin)/login/page.tsx`** - Login Page

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/admin/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Success - redirect to admin dashboard
    router.push('/admin/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Elysium Admin</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your menu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

### Session Management

**Cookie Storage:**
- Supabase stores JWT in httpOnly cookie
- Automatically refreshed before expiration
- Secure (https only in production)

**Session Duration:**
- Default: 1 week
- Configurable in Supabase dashboard
- Auto-refresh: 1 hour before expiry

**Logout:**
```typescript
// Clear session and redirect
await supabase.auth.signOut()
router.push('/login')
```

---

## 4. Component Architecture

### Admin Layout Hierarchy

```
┌────────────────────────────────────────────────────────────┐
│                    Admin Layout                            │
│  (src/app/(admin)/admin/layout.tsx)                        │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Admin Header                           │  │
│  │  Logo | Breadcrumb | User Menu (Logout)             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────┬──────────────────────────────────────┐  │
│  │             │                                       │  │
│  │   Sidebar   │         Page Content                  │  │
│  │             │                                       │  │
│  │ Dashboard   │  ┌─────────────────────────────────┐ │  │
│  │ Categories  │  │                                 │ │  │
│  │ Menu Items  │  │                                 │ │  │
│  │ Modifiers   │  │      Dynamic Page Slot          │ │  │
│  │ Promotions  │  │      (categories, items, etc.)  │ │  │
│  │ Settings    │  │                                 │ │  │
│  │ Users       │  │                                 │ │  │
│  │             │  └─────────────────────────────────┘ │  │
│  │             │                                       │  │
│  └─────────────┴──────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Key Components

#### **1. Admin Sidebar**

```typescript
// src/components/admin/layout/admin-sidebar.tsx

import { Home, Grid, Package, Sliders, Image, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/admin/categories', icon: Grid, label: 'Categories' },
  { href: '/admin/menu-items', icon: Package, label: 'Menu Items' },
  { href: '/admin/modifiers', icon: Sliders, label: 'Modifiers' },
  { href: '/admin/promotions', icon: Image, label: 'Promotions' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
  { href: '/admin/users', icon: Users, label: 'Admin Users' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/10">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

#### **2. Data Table (Reusable)**

```typescript
// src/components/admin/shared/data-table.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Column<T> {
  key: keyof T
  header: string
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  idKey: keyof T
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  idKey,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={String(col.key)}>{col.header}</TableHead>
          ))}
          {(onEdit || onDelete) && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={String(item[idKey])}>
            {columns.map((col) => (
              <TableCell key={String(col.key)}>
                {col.render
                  ? col.render(item[col.key], item)
                  : String(item[col.key])}
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

#### **3. Menu Item Form**

```typescript
// src/components/admin/menu-items/menu-item-form.tsx

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/shared/image-upload'
import { ModifierSelector } from './modifier-selector'
import { VariantInput } from './variant-input'

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().uuid('Invalid category'),
  price: z.number().nullable(),
  price_medium: z.number().nullable(),
  price_grande: z.number().nullable(),
  image_url: z.string().url().nullable(),
  tags: z.array(z.string()),
  is_available: z.boolean(),
  modifiers: z.array(z.string()), // modifier_group_ids
}).refine(
  (data) =>
    (data.price !== null && data.price_medium === null && data.price_grande === null) ||
    (data.price === null && data.price_medium !== null && data.price_grande !== null),
  {
    message: 'Must have either single price OR both size prices',
    path: ['price'],
  }
)

type MenuItemFormData = z.infer<typeof menuItemSchema>

interface MenuItemFormProps {
  initialData?: Partial<MenuItemFormData>
  onSubmit: (data: MenuItemFormData) => Promise<void>
  categories: Array<{ id: string; name: string }>
}

export function MenuItemForm({ initialData, onSubmit, categories }: MenuItemFormProps) {
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: initialData,
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div>
        <Label>Name</Label>
        <Input {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...form.register('description')} rows={3} />
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <Select {...form.register('category_id')}>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Pricing Variants */}
      <VariantInput form={form} />

      {/* Image Upload */}
      <ImageUpload
        value={form.watch('image_url')}
        onChange={(url) => form.setValue('image_url', url)}
      />

      {/* Modifiers */}
      <ModifierSelector
        selected={form.watch('modifiers') || []}
        onChange={(modifiers) => form.setValue('modifiers', modifiers)}
      />

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Switch
          checked={form.watch('is_available')}
          onCheckedChange={(checked) => form.setValue('is_available', checked)}
        />
        <Label>Available</Label>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save Menu Item'}
      </Button>
    </form>
  )
}
```

---

## 5. API Routes & Data Layer

### API Route Structure

**Pattern:**
- `GET /api/[resource]` - List all
- `POST /api/[resource]` - Create new
- `GET /api/[resource]/[id]` - Get single
- `PATCH /api/[resource]/[id]` - Update
- `DELETE /api/[resource]/[id]` - Delete

### Example: Categories API

```typescript
// src/app/api/categories/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  position: z.number().int().min(0),
  is_active: z.boolean(),
})

// GET /api/categories - List all categories
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Verify admin auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('position')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST /api/categories - Create category
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Verify admin auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Validate input
  const validation = categorySchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([validation.data])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

```typescript
// src/app/api/categories/[id]/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/categories/[id] - Get single category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// PATCH /api/categories/[id] - Update category
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Auth check
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('categories')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // Auth check
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### Client-Side API Hooks

```typescript
// src/lib/hooks/admin/use-categories.ts

import { useState, useEffect } from 'react'
import type { Category } from '@/lib/types/database'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories')
      const json = await res.json()

      if (!res.ok) throw new Error(json.error)

      setCategories(json.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const createCategory = async (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error)

    await fetchCategories() // Refresh list
    return json.data
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error)

    await fetchCategories() // Refresh list
    return json.data
  }

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error)
    }

    await fetchCategories() // Refresh list
  }

  const reorderCategories = async (categoryIds: string[]) => {
    const res = await fetch('/api/categories/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: categoryIds }),
    })

    if (!res.ok) {
      const json = await res.json()
      throw new Error(json.error)
    }

    await fetchCategories()
  }

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    refresh: fetchCategories,
  }
}
```

---

## 6. Visual Editor Architecture

### Concept: Inline Editing

The visual editor allows admins to see the **exact customer view** while editing inline.

```
┌─────────────────────────────────────────────────────────┐
│              Visual Editor Page                         │
│  /admin/visual-editor                                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  [Edit Mode: ON]  [Save Changes]  [Discard]      │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │         Customer Menu Preview                     │ │
│  │         (Exact same component as public)          │ │
│  │                                                   │ │
│  │  ┌─────────────────────────────────────────┐     │ │
│  │  │  Category: Calientes          [Edit]    │     │ │
│  │  ├─────────────────────────────────────────┤     │ │
│  │  │  ┌─────────┐                            │     │ │
│  │  │  │ Image   │  Espresso          [Edit]  │     │ │
│  │  │  └─────────┘  $40                       │     │ │
│  │  │                                          │     │ │
│  │  │  ┌─────────┐                            │     │ │
│  │  │  │ Image   │  Latte             [Edit]  │     │ │
│  │  │  └─────────┘  $70 / $75                 │     │ │
│  │  └─────────────────────────────────────────┘     │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// src/app/(admin)/admin/visual-editor/page.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { MenuSection } from '@/components/menu-section' // Existing component
import { CategoryNav } from '@/components/category-nav' // Existing component
import { useMenuItems } from '@/lib/hooks/admin/use-menu-items'
import { useCategories } from '@/lib/hooks/admin/use-categories'

export default function VisualEditorPage() {
  const [editMode, setEditMode] = useState(false)
  const { categories } = useCategories()
  const { menuItems } = useMenuItems()

  return (
    <div className="space-y-4">
      {/* Editor Controls */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Switch checked={editMode} onCheckedChange={setEditMode} />
          <span>Edit Mode</span>
        </div>

        {editMode && (
          <div className="flex gap-2">
            <Button variant="outline">Discard Changes</Button>
            <Button>Save Changes</Button>
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="rounded-lg border bg-background">
        <div className="p-4">
          <CategoryNav
            categories={categories}
            activeCategory={null}
            onCategoryChange={() => {}}
            editMode={editMode} // Pass edit mode flag
          />

          {categories.map((category) => (
            <MenuSection
              key={category.id}
              category={category}
              isActive={false}
              editMode={editMode} // Pass edit mode flag
              onEdit={(itemId) => {
                // Open edit modal
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Edit Mode Features

**When Edit Mode = ON:**
- Show "[Edit]" button next to each item
- Show reorder handles (drag & drop)
- Click item → open edit modal
- Click category → edit category

**When Edit Mode = OFF:**
- Pure customer view (no admin controls)
- Test how menu actually looks

---

## 7. Image Upload System

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Image Upload Flow                      │
└─────────────────────────────────────────────────────────┘

User drops/selects image
         │
         ↓
┌─────────────────────┐
│  ImageUpload.tsx    │  - Preview image
│  (Client Component) │  - Show crop tool
└──────────┬──────────┘  - Validate size/format
           │
           ↓
┌─────────────────────┐
│  ImageCropper.tsx   │  - Aspect ratio lock
│  (react-image-crop) │  - Zoom/rotate
└──────────┬──────────┘  - Preview result
           │
           ↓
Convert to blob/file
           │
           ↓
┌──────────────────────────────┐
│  POST /api/upload/menu-image │  - Validate auth
│  (Server Route)               │  - Check file type/size
└──────────┬───────────────────┘  - Generate unique filename
           │
           ↓
┌──────────────────────┐
│  Supabase Storage    │  - Upload to bucket
│  .upload()           │  - Return public URL
└──────────┬───────────┘
           │
           ↓
Return image URL to client
           │
           ↓
Save URL to database (menu_items.image_url)
```

### Implementation

#### **Image Upload Component**

```typescript
// src/components/admin/shared/image-upload.tsx

'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ImageCropper } from './image-cropper'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  bucket?: 'menu-images' | 'promotional-images' | 'branding'
}

export function ImageUpload({ value, onChange, bucket = 'menu-images' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
      setShowCropper(true)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true)
    setShowCropper(false)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', croppedBlob, selectedFile?.name || 'image.jpg')
      formData.append('bucket', bucket)

      // Upload to API
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      // Update parent with new URL
      onChange(json.url)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      setSelectedFile(null)
    }
  }

  const handleRemove = () => {
    onChange(null)
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <Image
            src={value}
            alt="Uploaded image"
            width={200}
            height={200}
            className="rounded-md object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP (max 5MB)</p>
        </div>
      )}

      {uploading && <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>}

      {showCropper && selectedFile && (
        <ImageCropper
          file={selectedFile}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false)
            setSelectedFile(null)
          }}
        />
      )}
    </div>
  )
}
```

#### **Upload API Route**

```typescript
// src/app/api/upload/image/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Verify admin auth
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = (formData.get('bucket') as string) || 'menu-images'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${bucket}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl, path: filePath })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

### Storage Buckets Setup

**Required Buckets:**
1. `menu-images` - Menu item photos
2. `promotional-images` - Carousel/banner images
3. `branding` - Logo, favicon

**Bucket Policies:**
```sql
-- Public read access
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('menu-images', 'promotional-images', 'branding'));

-- Admins can upload/delete
CREATE POLICY "Admins can manage images"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('menu-images', 'promotional-images', 'branding')
    AND auth.uid() IN (SELECT id FROM admin_users)
  );
```

---

## 8. Row Level Security (RLS) Policies

### Overview

RLS ensures data security at the database level. Even if API routes have bugs, the database blocks unauthorized access.

### Policy Design

```sql
-- =====================================================
-- ADMIN RLS POLICIES
-- =====================================================

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CATEGORIES
-- =====================================================

-- Public can view active categories (existing)
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- Admins can insert categories
CREATE POLICY "Admins can create categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- =====================================================
-- MENU ITEMS
-- =====================================================

-- Public can view available items (existing)
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (is_available = true);

-- Admins can view all items
CREATE POLICY "Admins can view all menu items"
  ON menu_items FOR SELECT
  USING (is_admin());

-- Admins can insert items
CREATE POLICY "Admins can create menu items"
  ON menu_items FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update items
CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete items
CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  USING (is_admin());

-- =====================================================
-- MODIFIER GROUPS & OPTIONS
-- =====================================================

-- Public can view all modifiers (needed for customization)
CREATE POLICY "Public can view modifier groups"
  ON modifier_groups FOR SELECT
  USING (true);

CREATE POLICY "Public can view modifier options"
  ON modifier_options FOR SELECT
  USING (true);

-- Admins can manage modifier groups
CREATE POLICY "Admins can manage modifier groups"
  ON modifier_groups FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can manage modifier options
CREATE POLICY "Admins can manage modifier options"
  ON modifier_options FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- MENU ITEM MODIFIERS (Junction Table)
-- =====================================================

-- Public can view linkages
CREATE POLICY "Public can view menu item modifiers"
  ON menu_item_modifiers FOR SELECT
  USING (true);

-- Admins can manage linkages
CREATE POLICY "Admins can manage menu item modifiers"
  ON menu_item_modifiers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- PROMOTIONAL IMAGES
-- =====================================================

-- Public can view active promos
CREATE POLICY "Public can view active promotional images"
  ON promotional_images FOR SELECT
  USING (is_active = true);

-- Admins can manage promos
CREATE POLICY "Admins can manage promotional images"
  ON promotional_images FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- SETTINGS
-- =====================================================

-- Public can view certain settings (e.g., WhatsApp number)
CREATE POLICY "Public can view public settings"
  ON settings FOR SELECT
  USING (key IN ('whatsapp_number', 'restaurant_name', 'business_hours'));

-- Admins can view all settings
CREATE POLICY "Admins can view all settings"
  ON settings FOR SELECT
  USING (is_admin());

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- ADMIN USERS
-- =====================================================

-- Admins can view all admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (is_admin());

-- Only super admins (role = 'admin') can manage admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    is_admin() AND
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    is_admin() AND
    (SELECT role FROM admin_users WHERE id = auth.uid()) = 'admin'
  );
```

### Testing RLS Policies

```typescript
// Test script to verify RLS works

import { supabase } from '@/lib/supabase/client'

// Test 1: Unauthenticated user can only see active categories
const { data: publicCategories } = await supabase
  .from('categories')
  .select('*')
// Should only return is_active = true

// Test 2: Admin can see all categories
const { data: adminCategories } = await supabase
  .from('categories')
  .select('*')
// Should return all categories (including inactive)

// Test 3: Unauthenticated user cannot create category
const { error } = await supabase
  .from('categories')
  .insert([{ name: 'Test', icon: 'Coffee', position: 0 }])
// Should fail with RLS error
```

---

## 9. Real-time Data Sync

### Supabase Realtime

When admins make changes, the public menu should update **immediately** without page refresh.

### Implementation

```typescript
// src/app/page.tsx (Public Menu)

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { MenuCategoryWithItems } from '@/lib/types/database'

export default function MenuPage() {
  const [menuData, setMenuData] = useState<MenuCategoryWithItems[]>([])

  useEffect(() => {
    // Initial load
    loadMenuData()

    // Subscribe to category changes
    const categorySubscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          console.log('Categories updated, refreshing menu...')
          loadMenuData()
        }
      )
      .subscribe()

    // Subscribe to menu item changes
    const itemsSubscription = supabase
      .channel('menu-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          console.log('Menu items updated, refreshing menu...')
          loadMenuData()
        }
      )
      .subscribe()

    return () => {
      categorySubscription.unsubscribe()
      itemsSubscription.unsubscribe()
    }
  }, [])

  const loadMenuData = async () => {
    // Fetch menu data...
  }

  return (
    // Menu UI...
  )
}
```

### Realtime Configuration

**Enable Realtime on Tables:**
```sql
-- Enable realtime for all menu tables
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE modifier_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE modifier_options;
ALTER PUBLICATION supabase_realtime ADD TABLE promotional_images;
```

**Benefits:**
- ✅ Admin saves change → public menu updates instantly
- ✅ Multiple admins can work simultaneously (see each other's changes)
- ✅ No polling needed (efficient)

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Day 1-2: Authentication**
- [ ] Create admin auth middleware
- [ ] Build login page
- [ ] Set up admin user table
- [ ] Create first admin user

**Day 3-4: Admin Layout**
- [ ] Build admin layout (sidebar, header)
- [ ] Create navigation components
- [ ] Set up routing structure

**Day 5-7: Categories CRUD**
- [ ] Build category list page
- [ ] Build category form (create/edit)
- [ ] Implement drag-and-drop reordering
- [ ] Test RLS policies

### Phase 2: Menu Items (Week 2)

**Day 1-3: Basic CRUD**
- [ ] Build menu item list page
- [ ] Build menu item form
- [ ] Implement variant pricing input
- [ ] Image upload integration

**Day 4-5: Modifiers**
- [ ] Modifier selector component
- [ ] Link items to modifier groups
- [ ] Test modifier assignment

**Day 6-7: Availability**
- [ ] Quick availability toggle
- [ ] Bulk availability update
- [ ] Stock management UI

### Phase 3: Modifiers System (Week 3)

**Day 1-3: Modifier Groups**
- [ ] Modifier group list page
- [ ] Group creation form
- [ ] Type selection (single/multiple/boolean)

**Day 4-5: Modifier Options**
- [ ] Option list within group
- [ ] Option creation/editing
- [ ] Price modifier input

**Day 6-7: Testing**
- [ ] Test all modifier types
- [ ] Verify price calculations
- [ ] Edge case testing

### Phase 4: Promotions & Settings (Week 4)

**Day 1-2: Promotional Images**
- [ ] Image grid view
- [ ] Upload/crop flow
- [ ] Position reordering

**Day 3-4: Settings**
- [ ] Create settings table migration
- [ ] General settings form
- [ ] Branding settings form
- [ ] Business hours form

**Day 5-7: Visual Editor**
- [ ] Build visual editor page
- [ ] Implement edit mode toggle
- [ ] Inline editing overlays
- [ ] Save changes flow

### Phase 5: Polish & Launch (Week 5)

**Day 1-2: Testing**
- [ ] End-to-end testing
- [ ] Mobile responsiveness
- [ ] Error handling

**Day 3-4: Documentation**
- [ ] User manual for restaurant owners
- [ ] Admin onboarding guide
- [ ] Video tutorials (optional)

**Day 5: Launch**
- [ ] Deploy to production
- [ ] Create admin accounts
- [ ] Train restaurant staff

---

## Appendix A: File Checklist

### New Files to Create

**Authentication:**
- [ ] `middleware.ts`
- [ ] `src/lib/supabase/admin-client.ts`
- [ ] `src/lib/hooks/admin/use-auth.ts`
- [ ] `src/app/(admin)/login/page.tsx`

**Admin Layout:**
- [ ] `src/app/(admin)/admin/layout.tsx`
- [ ] `src/components/admin/layout/admin-header.tsx`
- [ ] `src/components/admin/layout/admin-sidebar.tsx`

**API Routes:**
- [ ] `src/app/api/categories/route.ts`
- [ ] `src/app/api/categories/[id]/route.ts`
- [ ] `src/app/api/menu-items/route.ts`
- [ ] `src/app/api/menu-items/[id]/route.ts`
- [ ] `src/app/api/modifiers/route.ts`
- [ ] `src/app/api/upload/image/route.ts`

**Pages:**
- [ ] `src/app/(admin)/admin/dashboard/page.tsx`
- [ ] `src/app/(admin)/admin/categories/page.tsx`
- [ ] `src/app/(admin)/admin/menu-items/page.tsx`
- [ ] `src/app/(admin)/admin/modifiers/page.tsx`
- [ ] `src/app/(admin)/admin/visual-editor/page.tsx`

**Components:**
- [ ] `src/components/admin/shared/data-table.tsx`
- [ ] `src/components/admin/shared/image-upload.tsx`
- [ ] `src/components/admin/menu-items/menu-item-form.tsx`
- [ ] `src/components/admin/categories/category-form.tsx`

**Hooks:**
- [ ] `src/lib/hooks/admin/use-categories.ts`
- [ ] `src/lib/hooks/admin/use-menu-items.ts`
- [ ] `src/lib/hooks/admin/use-modifiers.ts`

---

## Summary

This architecture provides a **complete, production-ready admin panel** that:

✅ **Uses existing tech stack** (Next.js, React, TypeScript, Supabase)
✅ **Works with current schema** (no breaking changes)
✅ **Follows best practices** (RLS, auth, validation)
✅ **Real-time updates** (changes reflect immediately)
✅ **Mobile-friendly** (responsive design)
✅ **Secure** (multi-layer auth + RLS)
✅ **Scalable** (ready for multi-tenant future)

**Next Step:** Begin Phase 1 implementation (authentication & layout).
