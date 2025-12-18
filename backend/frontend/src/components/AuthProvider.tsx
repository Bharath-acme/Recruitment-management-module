import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Company {
    id?: number;
    name?: string;
    country?: string;
    size?: string;
    description?: string;
}

interface User {
    id?: string;
    email: string;
    name?: string;
    role?: string;
    company?: Company; 
}

interface LoginResponseData {
    access_token: string;
    token_type: string;
    user_data: any;
    all_companies: Company[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    userRole: string | null;
    allCompanies: Company[]; 
    signIn: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
    signOut: () => Promise<void>;
    signUp: (email: string, password: string, userData: any) => Promise<{ success?: boolean; error?: string }>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
    children: React.ReactNode;
}

const mapBackendUser = (backendData: any): User => {
    const rawCompany = backendData.company || {};
    const companyData: Company = {
        id: rawCompany.id,
        name: rawCompany.name,
        country: rawCompany.country,
        size: rawCompany.size,
        description: rawCompany.description,
    };
    return {
        id: backendData.id,
        email: backendData.email,
        name: backendData.name,
        role: backendData.role,
        company: companyData,
    };
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [userRole, setUserRole] = useState<string | null>(null);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);

    const fetchAndSetUser = async (token: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch user");
            
            const data = await res.json();
            const mappedUser = mapBackendUser(data);
            setUser(mappedUser);
            setUserRole(mappedUser.role || null);

            if (mappedUser.company?.name?.toLowerCase() === 'acme global hub') {
                const companiesRes = await fetch(`${API_BASE_URL}/companies`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (companiesRes.ok) {
                    const companiesData = await companiesRes.json();
                    setAllCompanies(companiesData);
                }
            }

        } catch (error) {
            console.error(error);
            localStorage.removeItem('token');
            setUser(null);
            setUserRole(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchAndSetUser(token).finally(() => setLoading(false));
        } else {
            setUser(null);
            setUserRole(null);
            setLoading(false);
        }
    }, []);

    const signIn = async (email: string, password: string): Promise<{ success?: boolean; error?: string }> => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json();
                return { error: err.detail || 'Login failed' };
            }
            
            const data: LoginResponseData = await res.json(); 
            localStorage.setItem('token', data.access_token);
            
            // Fetch the full user profile to ensure all data is fresh and complete
            await fetchAndSetUser(data.access_token);
            
            if (data.all_companies) {
                setAllCompanies(data.all_companies);
            }

            return { success: true };
        } catch (error: any) {
            return { error: error.message || "An unexpected error occurred." };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        localStorage.removeItem('token');
        setUser(null);
        setUserRole(null);
        setAllCompanies([]);
    };

    const signUp = async (email: string, password: string, userData: any): Promise<{ success?: boolean; error?: string }> => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, ...userData }),
            });

            if (!res.ok) {
                const err = await res.json();
                return { error: err.detail || "Signup failed" };
            }

            const loginRes = await signIn(email, password);
            
            if (loginRes.error) {
                return { error: "Signup succeeded but automatic login failed. Please log in manually." };
            }
            return { success: true };
        } catch (error: any) {
            return { error: error.message || "An unexpected error occurred during signup." };
        } finally {
            setLoading(false);
        }
    };


    const value = {
        user,
        loading,
        userRole,
        allCompanies, 
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