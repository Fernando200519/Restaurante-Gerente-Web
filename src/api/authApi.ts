import axios from "axios";

import { LoginRequest, LoginResponse } from "../types/auth";

const API_URL = "url_de_ejemplo";

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const { data } = await axios.post(`${API_URL}/login`, credentials);
  return data;
};
