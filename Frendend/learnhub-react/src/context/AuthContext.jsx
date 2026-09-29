/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("access_token") !== null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("learnhubUser");
    if (!savedUser) return null;

    try {
      const savedUserData = JSON.parse(savedUser);
      if (savedUserData.password) {
        delete savedUserData.password;
        localStorage.setItem("learnhubUser", JSON.stringify(savedUserData));
      }
      return savedUserData;
    } catch {
      localStorage.removeItem("learnhubUser");
      return null;
    }
  });

  useEffect(() => {
    const handleAuthError = () => {
      setIsLoggedIn(false);
      setUser(null);
    };

    window.addEventListener("auth:error", handleAuthError);
    return () => window.removeEventListener("auth:error", handleAuthError);
  }, []);

  const login = (token, userData = null) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("learnhubLoggedIn", "true");
    if (userData) {
      localStorage.setItem("learnhubUser", JSON.stringify(userData));
      setUser(userData);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("learnhubLoggedIn");
    localStorage.removeItem("learnhubUser");
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = useMemo(
    () => ({ isLoggedIn, user, setUser, login, logout }),
    [isLoggedIn, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
