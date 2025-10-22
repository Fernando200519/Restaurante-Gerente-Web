export interface LoginRequest {
  user: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    rol: string;
  };
}
