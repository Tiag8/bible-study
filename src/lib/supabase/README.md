# Supabase Client Usage Guide

This directory contains three different Supabase client configurations for different use cases in Next.js.

## 📁 File Overview

### `client.ts` - Browser Client
**Use in:** Client Components (components with `'use client'`)

```typescript
import { createClient } from '@/lib/supabase/client'

function MyClientComponent() {
  const supabase = createClient()
  // Use for client-side operations
}
```

### `server.ts` - Server Client
**Use in:** Server Components, Server Actions, Route Handlers

```typescript
import { createClient } from '@/lib/supabase/server'

async function MyServerComponent() {
  const supabase = await createClient()
  // Use for server-side operations
}
```

### `middleware.ts` - Middleware Client
**Use in:** Next.js middleware only (automatically used by `/middleware.ts`)

This is already configured in the root `middleware.ts` file. You don't need to import this directly.

## 🔐 Authentication Flow

### Protected Routes
The middleware automatically protects these routes:
- `/dashboard`
- `/editor`
- `/graph`
- `/settings`

If a user is not authenticated, they will be redirected to `/login` with a `redirectedFrom` parameter.

### Login/Signup Redirects
If a user is already logged in and tries to access `/login` or `/signup`, they will be redirected to `/dashboard`.

## 📝 Usage Examples

### Client Component Example
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

  return <div>{user?.email}</div>
}
```

### Server Component Example
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: studies } = await supabase
    .from('studies')
    .select('*')
    .eq('user_id', user.id)

  return <div>{/* Render studies */}</div>
}
```

### Server Action Example
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStudy(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('studies')
    .insert({
      title: formData.get('title'),
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard')
  return data
}
```

## 🔒 Row Level Security (RLS)

All tables should have RLS policies that use `auth.uid()` to ensure users can only access their own data:

```sql
-- Example RLS policy for studies table
CREATE POLICY "Users can only access their own studies"
ON studies
FOR ALL
USING (auth.uid() = user_id);
```

## 🚨 Important Notes

1. **Cookie Management:** The middleware handles cookie management automatically. Don't modify cookies manually unless you know what you're doing.

2. **Server vs Client:** Always use the correct client for your context:
   - `client.ts` for Client Components
   - `server.ts` for Server Components/Actions
   - Never mix them!

3. **Session Refresh:** The middleware automatically refreshes user sessions on each request.

4. **Type Safety:** Consider adding database types to get better TypeScript support:
   ```typescript
   import { Database } from '@/types/database'
   const supabase = createClient<Database>()
   ```

## 📚 References

- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Helpers](https://github.com/supabase/auth-helpers)
