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

  // 🎯 FIX 1: logoutUser debe forzar la redirección
  const logoutUser = useCallback(() => {
    console.log("🚪 Cerrando sesión...");
    setToken(null);
    setRole(null);
    setEstado(null);
    setUser(null);
    removeToken();

    // Si no usamos una librería de rutas (como react-router),
    // esta es la forma más segura de limpiar la app y sacarte al login.
    window.location.href = "/login";
  }, []);

  const loginUser = (data: LoginResponse) => {
    const jwt = data.accessToken;
    setToken(jwt);
    setRole(data.infoUsuario?.tipo ?? null);
    setEstado(data.infoUsuario?.estado ?? null);
    setUser(data.infoUsuario);
    saveToken(jwt);
  };

  // 🆕 FIX 2: Escuchar el evento 'auth-sync' para cuando el Interceptor refresque el token
  useEffect(() => {
    const syncAuth = () => {
      const currentToken = getToken();
      if (currentToken !== token) {
        setToken(currentToken);
        console.log("🔄 Contexto sincronizado con el nuevo Token");
      }
    };

    window.addEventListener("auth-sync", syncAuth);
    return () => window.removeEventListener("auth-sync", syncAuth);
  }, [token]);

  // 🛡️ FIX 3: Temporizador de vida del token
  useEffect(() => {
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;
      const timeLeft = expirationTime - Date.now();

      if (timeLeft <= 0) {
        logoutUser();
        return;
      }

      const timer = setTimeout(() => {
        toast.error("Sesión expirada", {
          description: "Tu sesión ha terminado por seguridad.",
          duration: 5000,
        });
        logoutUser();
      }, timeLeft);

      return () => clearTimeout(timer);
    } catch (error) {
      // Si el token es basura o está mal formado, te saca
      console.error("❌ Error de validación de sesión:", error);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
