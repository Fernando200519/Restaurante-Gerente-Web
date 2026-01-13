import axios from "axios";
import { apiClient, API_BASE_URL } from "./config";
import { LoginRequest, LoginResponse } from "../types/auth";
import { saveToken } from "../utils/storage";

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const { data } = await axios.post<LoginResponse>(
    `${API_BASE_URL}/login`,
    credentials,
    { withCredentials: true }
  );

  if (data.accessToken) {
    saveToken(data.accessToken);
  }

  return data;
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
