import { useState, useEffect, useMemo, useCallback } from "react";
import { Order, OrderStatus } from "../types/order";
import { getOrders, getOrderDetailById } from "../api/ordersApi";

export const useOrders = (pageSize = 50) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [globalStats, setGlobalStats] = useState<Record<string, number>>({
    Solicitado: 0,
    "En Preparación": 0,
    Listo: 0,
    Entregado: 0,
    Cancelada: 0,
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>("Solicitado");
  const [selectedDate, setSelectedDate] = useState(() => {
    const local = new Date();
    return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(local.getDate()).padStart(2, "0")}`;
  });

  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const result = await getOrders(
          page,
          pageSize,
          selectedDate,
          selectedStatus || undefined
        );

        setOrders(result.orders);
        setGlobalStats(result.stats);

        setTotalRecords(result.totalItems);
      } catch (error) {
        console.error("Error en hook:", error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [page, pageSize, selectedDate, selectedStatus]
  );

  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedDate, searchQuery]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const statusCounts = useMemo(() => globalStats, [globalStats]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        q === "" ||
        (o.id || "").includes(q) ||
        (o.waiter || "").toLowerCase().includes(q) ||
        o.items.some((i) => (i.name || "").toLowerCase().includes(q))
      );
    });
  }, [orders, searchQuery]);

  const fetchOrderDetail = useCallback(async (id: string) => {
    try {
      return await getOrderDetailById(id);
    } catch (error) {
      console.error("Error al obtener detalle desde el hook:", error);
      return null;
    }
  }, []);

  return {
    orders: filteredOrders,
    rawOrdersCount: orders.length,
    totalRecords,
    loading,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedDate,
    setSelectedDate,
    statusCounts: globalStats,
    fetchOrderDetail,
    refresh: () => loadOrders(false),
  };
};
