import axios from "axios";
import { LoginRequest, LoginResponse } from "../types/auth";

const API_URL = "http://137.184.191.81";

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  if (!API_URL) throw new Error("REACT_APP_API_URL no está definida");

  const { data } = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    credentials
  );

  return data;
};
