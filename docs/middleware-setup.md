# Next.js Middleware Setup - Route Protection

This document describes the middleware setup for route protection using Supabase authentication.

## 📁 Files Created

### Root Middleware
- **`/middleware.ts`** - Next.js middleware entry point that delegates to Supabase session handler

### Supabase Client Utilities
- **`/src/lib/supabase/client.ts`** - Browser client for Client Components
- **`/src/lib/supabase/server.ts`** - Server client for Server Components/Actions
- **`/src/lib/supabase/middleware.ts`** - Middleware client for session management
- **`/src/lib/supabase/README.md`** - Comprehensive usage guide

## 🔐 Protected Routes

The middleware automatically protects these routes and requires authentication:

- `/dashboard` - Main dashboard
- `/editor` - Bible study editor
- `/graph` - Knowledge graph view
- `/settings` - User settings

## 🚀 How It Works

### Authentication Flow

1. **Unauthenticated user accesses protected route:**
   - User is redirected to `/login`
   - Original URL is saved in `redirectedFrom` query parameter
   - After login, user can be redirected back to original destination

2. **Authenticated user accesses login/signup:**
   - User is automatically redirected to `/dashboard`
   - Prevents unnecessary login attempts

3. **Session refresh:**
   - Middleware automatically refreshes user sessions on each request
   - Prevents premature session expiration
   - Updates cookies with new session data

### Matcher Configuration

The middleware runs on all routes except:
- Static files (`_next/static/*`)
- Image optimization files (`_next/image/*`)
- Favicon
- Public assets (`.svg`, `.png`, `.jpg`, etc.)

## 🛠️ Usage Examples

### Checking Authentication in Server Component

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome, {user.email}!</div>
}
```

### Checking Authentication in Client Component

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function UserProfile() {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  if (!user) return <div>Please log in</div>

  return <div>{user.email}</div>
}
```

## ⚙️ Configuration

### Adding Protected Routes

To add more protected routes, edit `/src/lib/supabase/middleware.ts`:

```typescript
const protectedPaths = [
  '/dashboard',
  '/editor',
  '/graph',
  '/settings',
  '/your-new-route', // Add here
]
```

### Customizing Redirects

To change the default login redirect, modify the redirect logic in `/src/lib/supabase/middleware.ts`:

```typescript
if (isProtectedRoute && !user) {
  const url = request.nextUrl.clone()
  url.pathname = '/your-custom-login' // Change this
  url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}
```

## 🚨 Important Notes

1. **Cookie Management**
   - Middleware handles all cookie operations automatically
   - Never manually modify session cookies
   - Cookies are updated on every request to keep sessions fresh

2. **Client Selection**
   - Use `@/lib/supabase/client` for Client Components
   - Use `@/lib/supabase/server` for Server Components/Actions
   - Never mix client types!

3. **Session Persistence**
   - Sessions are automatically refreshed by middleware
   - Users won't be logged out unexpectedly
   - Proper cookie handling prevents sync issues

4. **Performance**
   - Middleware runs on every matched request
   - Optimized matcher pattern excludes static assets
   - Session check is fast and non-blocking

## 🔍 Troubleshooting

### Users Getting Logged Out Randomly

**Problem:** Session cookies not being properly updated

**Solution:** Ensure you're returning the `supabaseResponse` object from middleware without modifying cookies

### Infinite Redirect Loop

**Problem:** Protected route redirects to login, which redirects back

**Solution:** Check that `/login` is NOT in the `protectedPaths` array

### TypeScript Errors

**Problem:** Type errors in middleware

**Solution:** Ensure `@supabase/ssr` is installed and types are imported correctly:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
```

## 📚 References

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Helpers](https://github.com/supabase/auth-helpers)

## ✅ Testing Checklist

- [ ] Unauthenticated users are redirected from protected routes
- [ ] Authenticated users can access protected routes
- [ ] Users are redirected back after login (redirectedFrom parameter works)
- [ ] Authenticated users accessing /login are redirected to /dashboard
- [ ] Session persists across page refreshes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Cookies are being set properly (check DevTools)
