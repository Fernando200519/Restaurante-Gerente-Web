// auth.d.ts
export interface LoginRequest {
  correo: string;
  contraseña: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  estado: string;
}
