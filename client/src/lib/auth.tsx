import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { SafeUser, LoginCredentials, InsertUser, AuthResponse } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: InsertUser) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await apiRequest("POST", "/api/auth/login", credentials);
    const data: AuthResponse = await res.json();
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, []);

  const register = useCallback(async (userData: InsertUser) => {
    const res = await apiRequest("POST", "/api/auth/register", userData);
    const data: AuthResponse = await res.json();
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
