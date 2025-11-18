// auth.d.ts
export interface LoginRequest {
  correo: string;
  contraseña: string;
}

export interface LoginResponse {
  token: {
    result: string; // JWT REAL
    id: number; // Id del usuario
    exception: any;
    status: number;
    isCanceled: boolean;
    isCompleted: boolean;
    isCompletedSuccessfully: boolean;
    creationOptions: number;
    asyncState: any;
    isFaulted: boolean;
  };
}
