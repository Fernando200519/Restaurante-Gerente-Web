import React, { createContext, useState, useContext, ReactNode } from "react";
import { LoginResponse } from "../types/auth";
import { saveToken, removeToken } from "../utils/storage";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  loginUser: (data: LoginResponse) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const loginUser = (data: LoginResponse) => {
    const jwt = data.token.result;
    const id = data.token.id;

    setToken(jwt);
    setUserId(id);

    saveToken(jwt);
  };

  const logoutUser = () => {
    setToken(null);
    setUserId(null);
    removeToken();
  };

  return (
    <AuthContext.Provider value={{ token, userId, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
