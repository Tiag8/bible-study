"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'free';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref para prevenir chamadas concorrentes de fetchProfile
  const isFetchingProfileRef = useRef(false);

  const fetchProfile = async (userId: string, force = false) => {
    // Prevenir chamadas concorrentes (a menos que seja forçado)
    if (isFetchingProfileRef.current && !force) {
      console.log('[AUTH] fetchProfile SKIP - already fetching');
      return;
    }

    isFetchingProfileRef.current = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const timeoutMs = 10000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('[AUTH] fetchProfile timeout'));
        }, timeoutMs);
      });

      const queryPromise = supabase
        .from('bible_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);


      if (error) {
        console.error('Erro ao buscar profile:', error);
        setProfile(null);
        console.log('[AUTH] fetchProfile AFTER - profile set to NULL (error)');
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Erro inesperado ao buscar profile:', err);
      setProfile(null);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isFetchingProfileRef.current = false;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao obter sessão:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          // Pular fetchProfile para USER_UPDATED - será chamado manualmente via refreshProfile
          if (_event === 'USER_UPDATED') {
            return;
          }

          if (session?.user) {
            fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('[AUTH] onAuthStateChange ERROR:', err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user?.id) {
      // force=true para garantir que busca mesmo se outra chamada estiver em andamento
      await fetchProfile(user.id, true);
    } else {
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
