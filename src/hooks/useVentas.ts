import { useState, useEffect, useCallback } from "react";

import {
  reportsAPI,
  TopProduct,
  SalesSummaryResponse,
  DashboardStats,
  TopWaiter,
} from "../api/ventasApi";

export const useVentas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<SalesSummaryResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topWaiters, setTopWaiters] = useState<TopWaiter[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);

  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const loadVentasData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        from: `${dateRange.from}T00:00:00`,
        to: `${dateRange.to}T23:59:59`,
      };

      const [resSummary, resProducts, resWaiters, resDash] = await Promise.all([
        reportsAPI.getSalesSummary(filters),
        reportsAPI.getTopProducts({ ...filters, limit: 10 }),
        reportsAPI.getTopWaiters({ ...filters, limit: 10 }),
        reportsAPI.getDashboard(filters),
      ]);

      setSummary(resSummary);
      setTopProducts(resProducts);
      setTopWaiters(resWaiters);
      setDashboard(resDash);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
      setError("No se pudieron obtener los datos de ventas.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadVentasData();
  }, [loadVentasData]);

  return {
    summary,
    topProducts,
    topWaiters,
    dashboard,
    loading,
    error,
    dateRange,
    setDateRange,
    refresh: loadVentasData,
  };
};
