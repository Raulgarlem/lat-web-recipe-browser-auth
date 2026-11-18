import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CurrentUser } from "../types";
import { getCurrentUser } from "../utils/api";

type AuthContextValue = {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((user) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("auth-token");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function login(token: string, user: CurrentUser) {
    // guarda el token en localStorage ("auth-token"),
    localStorage.setItem("auth-token", token);
    // actualiza currentUser y pon isAuthenticated en true
    setCurrentUser(user);
    setIsAuthenticated(true);
  }
  function logout() {
    // elimina "auth-token" de localStorage,
    localStorage.removeItem("auth-token");
    // limpia currentUser y pon isAuthenticated en false
    setCurrentUser(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}