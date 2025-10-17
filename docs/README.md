# Documentation Index

## Active Documentation

### Setup & Configuration
- **SUPABASE_SETUP_GUIDE.md** (8.7K) - Complete Supabase setup guide (MAIN REFERENCE)
- **DATABASE_SCHEMA.md** (19K) - Database schema documentation
- **SCHEMA_DIAGRAM.md** (19K) - Visual schema diagrams

### Admin Panel
- **ADMIN_QUICKSTART.md** (../ADMIN_QUICKSTART.md - 3.2K) - Quick start guide for admin panel
- **ADMIN_AUTH_SETUP.md** (8.1K) - Authentication setup details
- **AUTH_IMPLEMENTATION_SUMMARY.md** (8.8K) - Auth implementation overview
- **ADMIN_PANEL_ARCHITECTURE.md** (66K) ⚠️ - Detailed architecture planning doc

### Features
- **UNLIMITED_VARIANTS_FEATURE.md** (11K) - Unlimited variants feature documentation
- **blueprint.md** (1.5K) - Project blueprint

## Context Usage Warnings

⚠️ **LARGE FILES** - Avoid loading these unless specifically needed:
- `ADMIN_PANEL_ARCHITECTURE.md` (66K) - Comprehensive planning doc, reference only
- `DATABASE_SCHEMA.md` (19K) - Use for schema questions only
- `SCHEMA_DIAGRAM.md` (19K) - Use for visual reference only

## Archived Documentation

The following have been moved to `../archive/` to reduce context usage:

### Archived Session Notes (`../archive/sessions/`)
- `SESSION_2025-10-13_CRITICAL_FAILURE.md`
- `SESSION_SUMMARY.md`
- `reddit-CLAUDE.md`

### Archived Reference Docs (`../archive/old-docs/`)
- `SCHEMA_AUDIT_REPORT.md` (33K) - Historical audit from October 2025
- `DATABASE_SETUP.md` - Superseded by SUPABASE_SETUP_GUIDE.md
- `SUPABASE_MIGRATION_README.md` - Consolidated into SUPABASE_SETUP_GUIDE.md

## Best Practices

### For Claude Code Sessions
1. **Start with Gemini CLI** to read large files like PROGRESS.md
2. **Avoid reading** ADMIN_PANEL_ARCHITECTURE.md unless doing architecture work
3. **Use specific docs** only when needed for that task
4. **Check this index** before reading docs to see file sizes

### For Development
1. **SUPABASE_SETUP_GUIDE.md** - Your main setup reference
2. **ADMIN_QUICKSTART.md** - Quick admin panel access
3. **PROGRESS.md** (../PROGRESS.md) - Current development status

## File Size Summary

| File | Size | Load Frequency |
|------|------|----------------|
| ADMIN_PANEL_ARCHITECTURE.md | 66K | ⚠️ Reference only |
| DATABASE_SCHEMA.md | 19K | As needed |
| SCHEMA_DIAGRAM.md | 19K | As needed |
| UNLIMITED_VARIANTS_FEATURE.md | 11K | As needed |
| AUTH_IMPLEMENTATION_SUMMARY.md | 8.8K | As needed |
| SUPABASE_SETUP_GUIDE.md | 8.7K | ✅ Main reference |
| ADMIN_AUTH_SETUP.md | 8.1K | As needed |
| blueprint.md | 1.5K | Rarely |

**Total docs/ size: ~175K** (but most should not be loaded in a single session)
