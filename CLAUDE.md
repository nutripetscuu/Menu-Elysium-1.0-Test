# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Menú ELYSIUM**, a professional Next.js 15 restaurant menu website for a Japanese restaurant. It's built as a single-page application with a modern, dark-mode aesthetic featuring smooth scroll navigation, scroll spy functionality, and mobile-first design. The project is **database-ready** with Supabase integration and structured for future admin panel collaboration.

## Current Development Status

**IMPORTANT: Context Optimization Protocol**

To maximize available context for actual development work:
- **NO status files** - These consume too much context when read repeatedly
- **User provides context** - At the start of each session, the user will tell you:
  - What was completed in the last session
  - Current blockers or issues
  - What to work on next
- **Use Gemini CLI for analysis** - When you need to analyze large files or understand existing implementations
- **Full history** - Detailed logs are archived in `archive/PROGRESS_DETAILED.md` if needed (use Gemini CLI to read)

**Current Phase:** Phase 1 - Core Admin Functionality
**Status:** Most core features completed (Categories, Menu Items, Modifiers, Promotions, Settings)
**Note:** User will provide specific session status and tasks

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

## Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

### File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the gemini command:

**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"
```

**Multiple files:**
```bash
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"
```

**Entire directory:**
```bash
gemini -p "@src/ Summarize the architecture of this codebase"
```

**Multiple directories:**
```bash
gemini -p "@src/ @tests/ Analyze test coverage for the source code"
```

**Current directory and subdirectories:**
```bash
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"
```

### Implementation Verification Examples

**Check if a feature is implemented:**
```bash
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"
```

**Verify authentication implementation:**
```bash
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"
```

**Check for specific patterns:**
```bash
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"
```

**Verify error handling:**
```bash
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"
```

**Check for rate limiting:**
```bash
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"
```

**Verify caching strategy:**
```bash
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"
```

**Check for specific security measures:**
```bash
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"
```

**Verify test coverage for features:**
```bash
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"
```

### When to Use Gemini CLI

Use `gemini -p` when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase
- **Instead of using Read tool on large/repeated files** - saves context

### Context Management Best Practices

**ALWAYS use Gemini CLI for:**
- Reading files > 5KB repeatedly
- Analyzing implementation patterns across multiple files
- Understanding existing architecture before building features
- Checking what already exists before creating new code

**NEVER:**
- Read large status/documentation files with Read tool
- Read the same file multiple times in one session
- Create status files that will be read repeatedly

**DO:**
- Ask user for session context at start
- Use Gemini CLI for codebase discovery
- Keep messages concise and focused
- Use TodoWrite for task tracking (small context cost)

### Important Notes

- Paths in `@` syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for `--yolo` flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results

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