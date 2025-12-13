// src/api/authApi.ts
import axios from "axios";
import { LoginRequest, LoginResponse } from "../types/auth";

// 1. LEER LA VARIABLE DE ENTORNO
// Usamos "||" como respaldo por si por alguna razón falla la lectura.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://137.184.191.81";

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

export const refreshSession = async (tokenVencido: string): Promise<string> => {
  const rawBody = `"${tokenVencido}"`;

  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: rawBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Error en refresh:", response.status, errorText);
    throw new Error(`Refresh falló: ${response.status}`);
  }

  const data: LoginResponse = await response.json();
  return data.accessToken;
};
