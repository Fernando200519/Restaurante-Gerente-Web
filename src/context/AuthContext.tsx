import React, { createContext, useState, useContext, ReactNode } from "react";
import { LoginResponse } from "../types/auth";
import { saveToken, removeToken } from "../utils/storage";

interface AuthContextType {
  user: LoginResponse["user"] | null;
  token: string | null;
  loginUser: (data: LoginResponse) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse["user"] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loginUser = (data: LoginResponse) => {
    setUser(data.user);
    setToken(data.token);
    saveToken(data.token);
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    removeToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
