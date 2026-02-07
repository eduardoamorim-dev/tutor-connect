import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import authApi from "../api/services/authApi";
import usersApi from "../api/services/usersApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há token na URL (callback do Google)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const verifyToken = async () => {
      const currentToken = urlToken || token;
      if (currentToken) {
        try {
          const res = await authApi.verify();
          if (res.data.valid) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await usersApi.getProfile();
      setUser(res.data);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  }, []);

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    refreshUser,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
