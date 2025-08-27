import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    if(session?.user) {
        try {
            const { data: userProfile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                // PGRST116 is "not found" error, which is fine for new users
                console.warn('Profile fetch error:', error);
            }
            setProfile(userProfile);
        } catch (err) {
            console.warn('Profile fetch failed:', err);
            setProfile(null);
        }
    } else {
        setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session fetch error:', error);
          setLoading(false);
          return;
        }
        handleSession(session);
      } catch (err) {
        console.warn('Session fetch failed:', err);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          handleSession(session);
        } catch (err) {
          console.warn('Auth state change error:', err);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up Failed",
          description: error.message || "Authentication service temporarily unavailable",
        });
      }

      return { error };
    } catch (err) {
      const errorMsg = "Authentication service temporarily unavailable. Please try again later.";
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: errorMsg,
      });
      return { error: { message: errorMsg } };
    }
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in Failed",
          description: error.message || "Authentication service temporarily unavailable",
        });
      }

      return { error };
    } catch (err) {
      const errorMsg = "Authentication service temporarily unavailable. Please try again later.";
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: errorMsg,
      });
      return { error: { message: errorMsg } };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    setProfile(null);
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, profile, session, loading, signUp, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
