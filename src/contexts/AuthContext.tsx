import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers = [
  { id: "1", name: "Demo User", email: "user@demo.com", password: "demo123", isAdmin: false },
  { id: "2", name: "Admin User", email: "admin@demo.com", password: "admin123", isAdmin: true },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("pdfstore_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [purchasedIds, setPurchasedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("pdfstore_purchased");
    return saved ? JSON.parse(saved) : [];
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
    
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("pdfstore_user", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (mockUsers.some((u) => u.email === email)) {
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      isAdmin: false,
    };
    
    setUser(newUser);
    localStorage.setItem("pdfstore_user", JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("pdfstore_user");
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
        isAdmin: user?.isAdmin ?? false,
        purchasedIds,
        login,
        signup,
        logout,
        purchaseProduct,
        hasPurchased,
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
