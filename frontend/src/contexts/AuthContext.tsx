import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { api } from '../lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Get initial session with proper error handling
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Check if user has profile (for existing sessions on page load)
        if (session?.user) {
          try {
            const profile = await api.auth.getProfile();
            setIsNewUser(!profile);
          } catch (error) {
            console.error('Profile check failed:', error);
            setIsNewUser(true); // Assume new user if profile fetch fails
          }
        }
      })
      .catch((error) => {
        console.error('Session restoration failed:', error);
        // Clear any corrupted session data
        setSession(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false); // CRITICAL: Always set loading to false
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Check if this is a new user signing in with OAuth
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if user has a profile via API
          const profile = await api.auth.getProfile();
          setIsNewUser(!profile);
        } catch (error) {
          // If profile not found, this is a new user
          setIsNewUser(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsNewUser(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isNewUser,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
