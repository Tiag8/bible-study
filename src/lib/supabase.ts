import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente para uso no browser (com RLS)
// Nota: Tipos customizados em @/types/database podem ser usados para cast quando necessário
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
