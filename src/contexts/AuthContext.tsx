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
    console.log('[AUTH] fetchProfile BEFORE - userId:', userId, 'isFetching:', isFetchingProfileRef.current, 'force:', force);

    // Prevenir chamadas concorrentes (a menos que seja forçado)
    if (isFetchingProfileRef.current && !force) {
      console.log('[AUTH] fetchProfile SKIP - already fetching');
      return;
    }

    isFetchingProfileRef.current = true;

    try {
      const { data, error } = await supabase
        .from('bible_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('[AUTH] fetchProfile QUERY RESULT - data:', data, 'error:', error);

      if (error) {
        console.error('Erro ao buscar profile:', error);
        setProfile(null);
        console.log('[AUTH] fetchProfile AFTER - profile set to NULL (error)');
        return;
      }

      setProfile(data);
      console.log('[AUTH] fetchProfile AFTER - profile set to:', data);
    } catch (err) {
      console.error('Erro inesperado ao buscar profile:', err);
      setProfile(null);
      console.log('[AUTH] fetchProfile AFTER - profile set to NULL (exception)');
    } finally {
      isFetchingProfileRef.current = false;
      console.log('[AUTH] fetchProfile FINALLY - isFetching reset to false');
    }
  };

  useEffect(() => {
    console.log('[AUTH] useEffect START');
    
    // Get initial session
    console.log('[AUTH] getSession BEFORE');
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        console.log('[AUTH] getSession AFTER - session:', session ? 'EXISTS' : 'NULL');
        console.log('[AUTH] getSession AFTER - user:', session?.user ? 'EXISTS' : 'NULL');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AUTH] Calling fetchProfile with userId:', session.user.id);
          await fetchProfile(session.user.id);
        } else {
          console.log('[AUTH] No session/user - skipping fetchProfile');
        }
        
        console.log('[AUTH] setLoading FALSE (initial session)');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao obter sessão:', error);
        console.log('[AUTH] setLoading FALSE (error getting session)');
        setLoading(false);
      });

    // Listen for auth changes
    console.log('[AUTH] Setting up onAuthStateChange listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[AUTH] onAuthStateChange TRIGGERED - event:', _event);
        console.log('[AUTH] onAuthStateChange - session:', session ? 'EXISTS' : 'NULL');

        setSession(session);
        setUser(session?.user ?? null);

        // Pular fetchProfile para USER_UPDATED - será chamado manualmente via refreshProfile
        if (_event === 'USER_UPDATED') {
          console.log('[AUTH] onAuthStateChange - USER_UPDATED event, skipping fetchProfile (will be called by refreshProfile)');
          return;
        }

        if (session?.user) {
          console.log('[AUTH] onAuthStateChange - calling fetchProfile with userId:', session.user.id);
          await fetchProfile(session.user.id);
        } else {
          console.log('[AUTH] onAuthStateChange - no session/user, setting profile to NULL');
          setProfile(null);
        }

        console.log('[AUTH] setLoading FALSE (onAuthStateChange)');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('[AUTH] signOut CALLED');
    await supabase.auth.signOut();
    console.log('[AUTH] signOut COMPLETE');
  };

  const refreshProfile = async () => {
    console.log('[AUTH] refreshProfile CALLED - user?.id:', user?.id);
    if (user?.id) {
      // force=true para garantir que busca mesmo se outra chamada estiver em andamento
      await fetchProfile(user.id, true);
    } else {
      console.log('[AUTH] refreshProfile - no user.id, skipping');
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
