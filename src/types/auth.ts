export interface LoginRequest {
  correo: string;
  contraseña: string;
}

export interface InfoUsuario {
  fotoUrl: string;
  notificaciones: any | null;
  nombre: string;
  apellidoPaterno: string;
  tipo: string;
  estado: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  infoUsuario: InfoUsuario;
}
