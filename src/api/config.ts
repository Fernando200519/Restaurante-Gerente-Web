import axios from "axios";
import { getToken, saveToken, removeToken } from "../utils/storage";
import { refreshSession } from "./authApi";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://137.184.191.81";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshSession();

        saveToken(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("La sesión expiró y no se pudo renovar:", refreshError);
        removeToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    console.error("Error en la API:", error);
    return Promise.reject(error);
  }
);

export const buildFetchHeaders = (contentType = "application/json") => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (contentType) headers["Content-Type"] = contentType;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};
