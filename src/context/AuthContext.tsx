import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { LoginResponse } from "../types/auth";
import { saveToken, removeToken, getToken } from "../utils/storage";

interface AuthContextType {
  token: string | null;
  role: string | null;
  estado: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loginUser: (data: LoginResponse) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [role, setRole] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const logoutUser = useCallback(() => {
    setToken(null);
    setRole(null);
    setEstado(null);
    setUser(null);
    removeToken();
  }, []);

  const loginUser = (data: LoginResponse) => {
    const jwt = data.accessToken;
    const rol = data.infoUsuario?.tipo ?? null;
    const estadoResp = data.infoUsuario?.estado ?? null;

    setToken(jwt);
    setRole(rol);
    setEstado(estadoResp);
    setUser(data.infoUsuario);
    saveToken(jwt);
  };

  useEffect(() => {
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      const timeLeft = expirationTime - currentTime;

      console.log(
        `⏱️ Sesión válida por: ${Math.round(timeLeft / 1000 / 60)} minutos`
      );

      if (timeLeft <= 0) {
        logoutUser();
        return;
      }

      const timer = setTimeout(() => {
        console.warn(
          "⚠️ El token ha expirado. Cerrando sesión por seguridad..."
        );

        toast.error("Sesión terminada", {
          description:
            "Por seguridad, tu sesión ha expirado. Ingresa de nuevo.",
          duration: 6000,
        });

        logoutUser();
      }, timeLeft);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("❌ Error al decodificar el token:", error);
      logoutUser();
    }
  }, [token, logoutUser]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        estado,
        user,
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
