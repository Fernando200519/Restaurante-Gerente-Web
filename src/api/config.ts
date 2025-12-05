import axios from "axios";
import { getToken } from "../utils/storage";

// URL base de la API - ajusta esta URL según tu servidor
const API_BASE_URL = "http://137.184.191.81";

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la API:", error);
    return Promise.reject(error);
  }
);

// Interceptor de petición para agregar Authorization header con el token almacenado
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      // Si ya existe Authorization, lo sobreescribimos
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper para fetch: construye headers con Authorization si hay token
export const buildFetchHeaders = (contentType = "application/json") => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};
