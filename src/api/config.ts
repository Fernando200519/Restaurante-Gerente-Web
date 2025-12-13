import axios from "axios";
import { getToken, saveToken, removeToken } from "../utils/storage";
import { refreshSession } from "./authApi";

// 1. LEER LA VARIABLE DE ENTORNO
// Exportamos esta constante por si algún otro archivo (que no sea authApi) la necesita.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://137.184.191.81";

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------------------------------------------------
// 1. INTERCEPTOR DE PETICIÓN (Request)
// Agrega el token a todas las llamadas que salgan usando apiClient
// -------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      // Forzamos el tipo 'any' para evitar quejas de TS sobre headers
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------------------------------------
// 2. INTERCEPTOR DE RESPUESTA (Response) - LA MAGIA DEL REFRESH
// Maneja errores globales y renueva el token si recibimos un 401
// -------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response, // Si todo sale bien, pasamos la respuesta
  async (error) => {
    const originalRequest = error.config;

    // Detectamos error 401 (No autorizado) y que no sea un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos para evitar bucles infinitos

      try {
        const oldToken = getToken();
        // Si no hay token viejo, no podemos refrescar nada
        if (!oldToken) throw new Error("No hay token para refrescar");

        // A. Llamamos al endpoint de refresh
        const newToken = await refreshSession(oldToken);

        // B. Guardamos el nuevo token
        saveToken(newToken);

        // C. Actualizamos el header de la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // D. Actualizamos los headers por defecto de la instancia para futuras peticiones
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        // E. Reintentamos la petición original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla (token muy viejo o inválido), cerramos sesión.
        console.error("La sesión expiró y no se pudo renovar:", refreshError);
        removeToken();
        window.location.href = "/login"; // Redirigir al login
        return Promise.reject(refreshError);
      }
    }

    // Si es otro error (404, 500), lo dejamos pasar
    console.error("Error en la API:", error);
    return Promise.reject(error);
  }
);

// Helper para fetch (Legacy)
export const buildFetchHeaders = (contentType = "application/json") => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};
