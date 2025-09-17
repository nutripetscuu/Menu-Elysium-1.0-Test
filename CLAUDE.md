# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Menú ELYSIUM**, a professional Next.js 15 restaurant menu website for a Japanese restaurant. It's built as a single-page application with a modern, dark-mode aesthetic featuring smooth scroll navigation, scroll spy functionality, and mobile-first design. The project is **database-ready** with Supabase integration and structured for future admin panel collaboration.

## Development Commands

```bash
# Development server (runs on port 9002 by default, or specified port)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run typecheck

# Genkit AI development
npm run genkit:dev
npm run genkit:watch
```

## Architecture

### Core Structure
- **Next.js App Router**: Uses the new app directory structure with server and client components
- **TypeScript**: Fully typed with strict mode and comprehensive type definitions
- **Tailwind CSS**: Utility-first styling with custom Japanese restaurant theme
- **Shadcn/ui**: Component library with Radix UI primitives
- **Supabase Ready**: Database abstraction layer prepared for Supabase integration

### Key Components
- **Sticky Header**: Contains hamburger menu, logo, and contact info with smooth scroll navigation
- **Category Navigation**: Horizontally scrollable menu categories with active state tracking
- **Scroll Spy**: Dynamic highlighting of active categories based on scroll position (optimized with throttling)
- **Menu Sections**: Database-driven menu display with proper error handling and loading states
- **Error Boundaries**: Comprehensive error handling for production resilience

### Navigation System
- **Single Page Application**: Smooth scroll-based navigation instead of routing
- **Hash URLs**: Support for direct linking to sections via URL hash
- **Mobile Optimized**: Touch-friendly navigation with proper accessibility

### Database Integration
- **API Abstraction**: Clean separation between data layer and components (`src/lib/api/`)
- **Type Safety**: Zod schemas for validation and TypeScript interfaces
- **Future Ready**: Structured for Supabase database and admin panel integration
- **Migration Support**: Legacy data conversion utilities included

### Design System
- **Colors**: Professional dark theme with Japanese restaurant aesthetics
  - Background: Deep charcoal (#121212)
  - Primary: Steel blue accent (#B0C4DE)  
  - Custom: Cherry blossom, bamboo green, sake white palette
- **Typography**: Inter font family with optimized loading
- **Icons**: Lucide React icons for menu categories and UI elements
- **Layout**: Mobile-first responsive design with elegant spacing

### Data Structure

#### Database Tables (Supabase Ready)
- **categories**: Menu categories with position and active status
- **menu_items**: Individual menu items with pricing, descriptions, images
- **admin_users**: Admin user management for future admin panel

#### Type Definitions
- Located in `src/lib/types/database.ts`
- Zod schemas for validation
- TypeScript interfaces for type safety
- Legacy conversion utilities

### Performance Optimizations
- **Scroll Throttling**: Optimized scroll event handling (100ms throttle)
- **Image Loading**: Prepared for lazy loading and optimization
- **Caching**: API response caching infrastructure
- **Mobile Performance**: Hydration-safe mobile detection

### Error Handling
- **Error Boundaries**: React error boundaries for graceful failures
- **Loading States**: Proper loading indicators and skeletons
- **Retry Logic**: User-friendly error recovery
- **Development Errors**: Detailed error reporting in development mode

### Path Aliases
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/ui` → `src/components/ui`

### Future Integration Points

#### Admin Panel Ready
- Database schema prepared
- API endpoints structured
- Authentication hooks ready
- CRUD operations scaffolded

#### Supabase Integration
- Client configuration ready (`src/lib/supabase/client.ts`)
- Database schema SQL prepared
- Storage buckets configured
- Row Level Security policies defined

### Environment Configuration
- **Development**: Uses static data fallback
- **Production**: Ready for database connection
- **Environment Variables**: Comprehensive `.env.example` provided
- **Setup Guide**: Complete database setup instructions in `DATABASE_SETUP.md`

## Important Safety Reminders

### Claude Code Session Management
- **NEVER terminate Claude Code**: Do not run commands that would kill or terminate the Claude Code process
- **Avoid system-level interrupts**: Be careful with commands like `taskkill`, `pkill`, or system shutdown commands
- **No process termination**: Never use commands like `kill`, `killall`, `pkill`, `taskkill /f`, or similar
- **No system restarts**: Avoid `shutdown`, `reboot`, `restart`, or system-level commands
- **Safe development only**: Stick to development commands like `npm run dev`, `npm run build`, etc.
- **Graceful operations**: Always use proper development commands and avoid force-terminating processes
- **Session continuity**: Preserve the development session to maintain context and avoid losing progress
- **Error recovery**: If commands fail, debug and fix rather than force-killing processes