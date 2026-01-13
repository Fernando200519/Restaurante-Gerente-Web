import { apiClient } from "./config";

export interface SalesSummaryResponse {
  totalVentas: number;
  subtotal: number;
  impuestos: number;
  totalOrdenesCerradas: number;
}

export interface TopProduct {
  productoId: number;
  producto: string;
  totalVentas: number;
  cantidad: number;
}

export interface TopWaiter {
  empleadoId: number;
  fotoPerfil: string | null;
  nombre: string;
  totalVentas: number;
}

export interface TopTable {
  id: number;
  numero: string;
  frecuenciaUso: number;
}

export interface DashboardStats {
  ventasHoy: number;
  ordenesActivas: number;
  mesasOcupadas: number;
  crecimientoVsAyer: number;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  limit?: number;
}

export const reportsAPI = {
  getDashboard: async (filters: ReportFilters): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>("/reports/dashboard", {
      params: filters,
    });
    return data;
  },

  getSalesSummary: async (
    filters: ReportFilters
  ): Promise<SalesSummaryResponse> => {
    const { data } = await apiClient.get<SalesSummaryResponse>(
      "/reports/sales-summary",
      {
        params: filters,
      }
    );
    return data;
  },

  getTopProducts: async (filters: ReportFilters): Promise<TopProduct[]> => {
    const { data } = await apiClient.get<TopProduct[]>(
      "/reports/top-products",
      {
        params: { limit: 10, ...filters },
      }
    );
    return data;
  },

  getTopWaiters: async (filters: ReportFilters): Promise<TopWaiter[]> => {
    const { data } = await apiClient.get<TopWaiter[]>("/reports/top-waiters", {
      params: { limit: 10, ...filters },
    });
    return data;
  },

  getTopTables: async (filters: ReportFilters): Promise<TopTable[]> => {
    const { data } = await apiClient.get<TopTable[]>("/reports/top-tables", {
      params: { limit: 10, ...filters },
    });
    return data;
  },
};
