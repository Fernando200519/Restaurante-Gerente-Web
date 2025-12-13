export interface LoginRequest {
  correo: string;
  contraseña: string;
}

export interface InfoUsuario {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipo: string;
  fotoUrl: string;
  estado: string;
}

export interface LoginResponse {
  accessToken: string;
  estado: string;
  infoUsuario: InfoUsuario;
}
