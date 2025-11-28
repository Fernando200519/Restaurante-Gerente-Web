import React, { createContext, useState, useContext, ReactNode } from "react";
import { LoginResponse } from "../types/auth";
import { saveToken, removeToken, getToken } from "../utils/storage";

interface AuthContextType {
  token: string | null;
  role: string | null;
  estado: string | null;
  isAuthenticated: boolean;
  loginUser: (data: LoginResponse) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getToken());

  const [role, setRole] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);

  const loginUser = (data: LoginResponse) => {
    const jwt = data.token;
    const rol = data.rol ?? null;
    const estadoResp = data.estado ?? null;

    setToken(jwt);
    setRole(rol);
    setEstado(estadoResp);

    saveToken(jwt);
  };

  const logoutUser = () => {
    setToken(null);
    setRole(null);
    setEstado(null);
    removeToken();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        estado,
        isAuthenticated: !!token,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
