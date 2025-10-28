import React, { createContext, useContext, useEffect, useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Removed supabase imports and client


interface User {
  id?: string;
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
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in localStorage and fetch user info if exists
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setUser(data);
            setUserRole(data.role);
          } else {
            setUser(null);
            setUserRole(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setUserRole(null);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      return { error: err.detail || 'Login failed' };
    }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    // Fetch user info
    const userRes = await fetch(`${API_BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    const userData = await userRes.json();
    setUser(userData);
    setUserRole(userData.role);
    return { data: userData };
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserRole(null);
  };

const signUp = async (email: string, password: string, userData: any) => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, ...userData }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || "Signup failed" };
  }

  const result = await res.json();

  // If backend returns token
  if (result.access_token) {
    localStorage.setItem("token", result.access_token);

    const userRes = await fetch(`${API_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${result.access_token}` },
    });
    const userInfo = await userRes.json();

    setUser(userInfo);
    setUserRole(userInfo.role);

    return { data: userInfo };
  } else {
    // fallback: auto-login using signIn
    const loginRes = await signIn(email, password);
    if (loginRes.error) {
      return { error: "Signup succeeded but login failed. Please log in manually." };
    }
    return loginRes;
  }
};


  const value = {
    user,
    loading,
    userRole,
    signIn,
    signOut,
    signUp,
    setUser
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