import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  company?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          role: session.user.user_metadata?.role || 'recruiter',
          company: session.user.user_metadata?.company,
          country: session.user.user_metadata?.country
        };
        setUser(userData);
        setUserRole(userData.role);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            role: session.user.user_metadata?.role || 'recruiter',
            company: session.user.user_metadata?.company,
            country: session.user.user_metadata?.country
          };
          setUser(userData);
          setUserRole(userData.role);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    // This will be handled by the server for proper user creation
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        userData
      })
    });

    const result = await response.json();
    return result;
  };

  const value = {
    user,
    loading,
    userRole,
    signIn,
    signOut,
    signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}