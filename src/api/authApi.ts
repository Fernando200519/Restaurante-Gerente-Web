import axios from "axios";
import { apiClient } from "./config";
import { LoginRequest, LoginResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://137.184.191.81";

// axios.defaults.withCredentials = true;

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  if (!API_BASE_URL) throw new Error("VITE_API_URL no está definida");

  const { data } = await axios.post<LoginResponse>(
    `${API_BASE_URL}/login`,
    credentials
  );

  return data;
};

export const refreshSession = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "omit",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Error en refresh:", response.status, errorText);
    throw new Error(`Refresh falló: ${response.status}`);
  }

  const data: LoginResponse = await response.json();
  return data.accessToken;
};

export const forgotPassword = async (
  email: string,
  clientUri: string
): Promise<void> => {
  await axios.post(`${API_BASE_URL}/password/forgot`, {
    email,
    clientUri,
  });
};

export const resetPassword = async (resetData: any): Promise<void> => {
  await axios.post(`${API_BASE_URL}/password/reset`, resetData);
};

export const updatePassword = async (passwordData: {
  contraseñaActual: string;
  contraseñaNueva: string;
  confirmacionContraseñaNueva: string;
}): Promise<void> => {
  await apiClient.post(`/users/me/update-password`, passwordData);
};
