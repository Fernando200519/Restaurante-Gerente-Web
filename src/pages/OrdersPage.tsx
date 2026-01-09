import React, { useRef, useEffect, useState } from "react";
import { Search, X, Calendar, RefreshCw } from "lucide-react";
import { StatsHeader } from "../components/orders/StatsHeader";
import { OrdersTable } from "../components/orders/OrdersTable";
import { useOrders } from "../hooks/useOrders";
import { OrderDetailsModal } from "../components/orders/OrdersDetailModal";
import { Order } from "../types/order";
import OrdersTableSkeleton from "../components/orders/OrdersTableSkeleton";

const OrdersPage: React.FC = () => {
  const {
    orders,
    loading,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedDate,
    setSelectedDate,
    statusCounts,
    refresh,
  } = useOrders(50);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  useEffect(() => {
    const interval = setInterval(() => refresh(), 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const renderMainContent = () => {
    if (loading && orders.length === 0 && page === 1) {
      return (
        <div className="bg-white rounded-[3rem] border border-gray-100 flex flex-col items-center justify-center py-40 space-y-6 shadow-sm animate-in fade-in">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-100 border-t-[#FF8108] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw size={24} className="text-[#FF8108] opacity-20" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-black uppercase tracking-[0.2em] text-sm">
              Sincronizando Base de Datos
            </p>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              Conectando con el servidor...
            </p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="animate-in fade-in duration-300">
          <OrdersTableSkeleton />
        </div>
      );
    }

    if (orders.length > 0) {
      return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <OrdersTable
            orders={orders}
            currentPage={page}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            pageSize={50}
            onViewOrder={(order) => setSelectedOrder(order)}
          />
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-50 py-40 text-center flex flex-col items-center animate-in fade-in">
        <div className="bg-orange-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-orange-100">
          <Search className="text-[#FF8108] opacity-30" size={48} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
          Sin coincidencias
        </h3>
        <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px] max-w-xs">
          No se encontraron órdenes que coincidan con los filtros de estado o
          fecha seleccionados
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-4 animate-in fade-in duration-700">
      {/* 📊 SECCIÓN DE RESUMEN */}
      <section className="relative z-30">
        <StatsHeader
          counts={statusCounts}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
        />
      </section>

      {/* 🛠️ CONSOLA DE FILTROS: En un nivel inferior a los stats */}
      <div className="relative z-10 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-4 items-center overflow-visible">
        {/* Buscador */}
        <div className="relative flex-1 group w-full z-10">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8108] transition-colors"
            size={20}
            strokeWidth={3}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, mesa, mesero o platillo..."
            className="w-full pl-14 pr-12 py-4 bg-gray-50 border-2 border-gray-50 rounded-3xl outline-none focus:ring-4 focus:ring-orange-50 focus:border-[#FF8108] focus:bg-white transition-all font-bold text-gray-700 placeholder:text-gray-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Selector de Fecha Estilizado */}
        <div
          className="relative w-full lg:w-72 group cursor-pointer z-10"
          onClick={() => (dateInputRef.current as any)?.showPicker?.()}
        >
          <Calendar
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#FF8108] transition-colors"
            size={20}
            strokeWidth={2.5}
          />
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            max={new Date().toLocaleDateString("en-CA")}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-3xl outline-none focus:border-[#FF8108] focus:bg-white transition-all font-black text-gray-700 cursor-pointer tabular-nums"
          />
        </div>

        {/* Botón de Refresco Manual */}
        <button
          onClick={() => refresh()}
          className="p-4 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 cursor-pointer group z-10"
          title="Sincronizar ahora"
        >
          <RefreshCw
            size={24}
            strokeWidth={2.5}
            className={`${
              loading
                ? "animate-spin text-[#FF8108]"
                : "group-hover:rotate-180 transition-transform duration-500"
            }`}
          />
        </button>
      </div>

      {/* 🚀 EL CAMBIO ESTÁ AQUÍ: Invocamos la función de renderizado */}
      <div className="relative z-0 min-h-[500px] pt-4">
        {renderMainContent()}
      </div>

      {/* 🚀 MODAL AL FINAL PARA EVITAR CONFLICTOS DE Z-INDEX */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrdersPage;
