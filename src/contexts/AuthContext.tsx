import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  purchasedIds: string[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  purchaseProduct: (productId: string) => void;
  hasPurchased: (productId: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("pdfstore_purchased");
    return saved ? JSON.parse(saved) : [];
  });

  const mapSupabaseUser = async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      setIsAdmin(false);
      return;
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", supabaseUser.id)
      .single();

    setUser({
      id: supabaseUser.id,
      name: profile?.name || supabaseUser.user_metadata?.name || "",
      email: profile?.email || supabaseUser.email || "",
    });

    // Check admin role
    const { data: roleCheck } = await supabase.rpc("has_role", {
      _user_id: supabaseUser.id,
      _role: "admin",
    });
    setIsAdmin(!!roleCheck);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await mapSupabaseUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await mapSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  const purchaseProduct = useCallback((productId: string) => {
    setPurchasedIds((prev) => {
      if (prev.includes(productId)) return prev;
      const updated = [...prev, productId];
      localStorage.setItem("pdfstore_purchased", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasPurchased = useCallback(
    (productId: string) => purchasedIds.includes(productId),
    [purchasedIds]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        purchasedIds,
        login,
        signup,
        logout,
        purchaseProduct,
        hasPurchased,
        loading,
      }}
    >
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
