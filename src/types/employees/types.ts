export type EmployeeRole = 'mesero' | 'cocinero' | 'cajero';

export type EmployeeStatus = 'activo' | 'inactivo';

export type Gender = 'masculino' | 'femenino' | 'otro';

export type Employee = {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  gender?: Gender;
};

export type EmployeeFormData = {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
  role: EmployeeRole;
  gender?: Gender;
  username: string;
  phone?: string;
};

export type EmployeeStats = {
  meseros: number;
  cocineros: number;
  cajeros: number;
  asistencia: number;
  total: number;
};

