# Sidebar Update Summary

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20250125_002_create_profiles_table.sql`

Created a new `bible_profiles` table to store user profile information:
- `id` (UUID) - References auth.users
- `full_name` (TEXT) - User's full name
- `role` (TEXT) - Either 'admin' or 'free' (default: 'free')
- `created_at`, `updated_at` timestamps

Features:
- RLS (Row Level Security) enabled
- Auto-creates profile on user signup via trigger
- Extracts full_name from user metadata or falls back to email

### 2. AuthContext Updates
**File**: `src/contexts/AuthContext.tsx`

Enhanced AuthContext to include profile data:
- Added `Profile` interface with id, full_name, role, timestamps
- Added `profile` state and `fetchProfile` function
- Modified auth state change listeners to fetch profile data
- Profile is now available via `useAuth()` hook

### 3. Sidebar Component Updates
**File**: `src/components/dashboard/Sidebar.tsx`

Updated the Sidebar to display user information:

**When Expanded:**
- Shows circular avatar with first letter of name (blue background)
- Displays "Olá, {firstName}" below avatar
- Shows role badge:
  - Blue "Admin" badge for admin role
  - Gray "Free" badge for free role
- Maintains logout button functionality

**When Collapsed:**
- Shows just the circular avatar with first letter
- Tooltip displays full name and role on hover
- Compact layout maintains all functionality

## How to Apply Migration

Run the migration to create the profiles table:

```bash
# Using Supabase CLI
supabase db reset  # This will run all migrations

# Or apply just this migration
supabase migration up --local
```

## Next Steps

1. Apply the database migration
2. Test the sidebar with different user types (admin and free)
3. Ensure existing users get profiles created automatically
4. Verify role badge styling matches design system

## Features

- ✅ First name extraction from full_name
- ✅ Role-based badge display (admin/free)
- ✅ Avatar with first letter initial
- ✅ Responsive collapsed/expanded states
- ✅ Maintains existing logout functionality
- ✅ Graceful fallback to 'Usuário' if name is missing
- ✅ Auto-profile creation on signup
