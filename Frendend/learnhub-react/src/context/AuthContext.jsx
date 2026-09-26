import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("learnhubLoggedIn") === "true");
  const login = () => {
    localStorage.setItem("learnhubLoggedIn", "true");
    setIsLoggedIn(true);
  };
  const logout = () => {
    localStorage.removeItem("learnhubLoggedIn");
    setIsLoggedIn(false);
  };
  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
