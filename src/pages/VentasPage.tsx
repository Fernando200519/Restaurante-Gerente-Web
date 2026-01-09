import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

// Datos de prueba para la gráfica (Simulación de una semana)
const salesData = [
  { name: "Lun", ingresos: 14000 },
  { name: "Mar", ingresos: 18500 },
  { name: "Mié", ingresos: 12000 },
  { name: "Jue", ingresos: 21000 },
  { name: "Vie", ingresos: 35000 },
  { name: "Sáb", ingresos: 42000 },
  { name: "Dom", ingresos: 38000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-800 backdrop-blur-sm bg-opacity-95">
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-[#FF8108] rounded-full"></div>
          <div>
            <p className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none">
              ${payload[0].value.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-[#FF8108] uppercase tracking-widest mt-1">
              Ingresos brutos
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const VentasPage: React.FC = () => {
  // const [dateRange, setDateRange] = useState({ start: "", end: "" }); // (Sin uso por ahora)

  return (
    <main className="max-w-[1600px] mx-auto pb-20 space-y-10 animate-in fade-in duration-700">
      {/* 🏢 ENCABEZADO INDUSTRIAL (Igual) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            Reporte de Ventas <span className="text-[#FF8108]">.</span>
          </h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em] mt-2 ml-1 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#FF8108]" />
            Análisis de Ingresos y Rendimiento
          </p>
        </div>

        <button className="flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:bg-black active:scale-95 cursor-pointer">
          <Download size={18} strokeWidth={3} />
          Exportar PDF
        </button>
      </div>

      {/* 📊 SECCIÓN DE KPIs (Igual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <VentasStatCard
          title="Ingresos Totales"
          value="$181,000.00"
          change="+12.5%"
          isPositive={true}
          icon={DollarSign}
          color="text-emerald-500"
        />
        {/* ... resto de KPIs */}
        <VentasStatCard
          title="Órdenes Cerradas"
          value="1,240"
          change="+8.2%"
          isPositive={true}
          icon={ShoppingBag}
          color="text-blue-500"
        />
        <VentasStatCard
          title="Ticket Promedio"
          value="$350.00"
          change="-2.4%"
          isPositive={false}
          icon={Target}
          color="text-[#FF8108]"
        />
        <VentasStatCard
          title="Nuevos Clientes"
          value="85"
          change="+15.0%"
          isPositive={true}
          icon={Users}
          color="text-purple-500"
        />
      </div>

      {/* 🛠️ TOOLBAR DE FILTROS (Igual) */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-6 items-center">
        {/* ... inputs de fecha */}
        <div className="flex items-center gap-4 w-full">
          <div className="relative flex-1 group">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-[#FF8108] focus:bg-white transition-all font-bold text-gray-700"
            />
          </div>
          <span className="font-black text-gray-300 uppercase text-xs">a</span>
          <div className="relative flex-1 group">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="date"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none focus:border-[#FF8108] focus:bg-white transition-all font-bold text-gray-700"
            />
          </div>
        </div>
        <button className="w-full lg:w-auto px-10 py-4 bg-[#FF8108] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 cursor-pointer">
          Filtrar Datos
        </button>
      </div>

      {/* 📈 ZONA DE GRÁFICAS REAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CONTENEDOR DE LA GRÁFICA */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 p-8 h-[500px] flex flex-col relative overflow-hidden shadow-sm">
          {/* Header de la Gráfica */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                Flujo de Ventas Semanal
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                Tendencia de ingresos brutos
              </p>
            </div>
            <div className="bg-orange-50 p-3 rounded-2xl">
              <TrendingUp
                className="text-[#FF8108]"
                size={28}
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* IMPLEMENTACIÓN DE RECHARTS */}
          <div className="flex-1 w-full -ml-4">
            {/* Margen negativo para compensar el padding del eje Y */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  {/* Gradiente para un efecto visual sutil debajo de la línea */}
                  <linearGradient
                    id="colorIngresos"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#FF8108" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FF8108" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 800,
                    style: {
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    },
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 800,
                    style: {
                      fontVariantNumeric: "tabular-nums",
                    },
                  }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                  dx={-10}
                />
                {/* Usamos nuestro Tooltip personalizado */}
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#FF8108",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />
                {/* Opcional: Un área sutil debajo de la línea */}
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="none"
                  fill="url(#colorIngresos)"
                />
                {/* La línea principal */}
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#FF8108"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "white",
                    stroke: "#FF8108",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#FF8108" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Platillos (Igual) */}
        <div className="bg-gray-900 rounded-[3rem] p-10 h-[500px] text-white flex flex-col shadow-2xl relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
            <Target size={140} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic mb-10 relative z-10">
            Top Platillos
          </h3>
          <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar relative z-10">
            <TopItem
              name="Tlayuda Oaxaqueña"
              sales="450"
              amount="$54,000"
              percentage={90}
            />
            <TopItem
              name="Mezcal Espadín"
              sales="320"
              amount="$96,000"
              percentage={75}
            />
            <TopItem
              name="Tasajo Especial"
              sales="210"
              amount="$31,500"
              percentage={50}
            />
            <TopItem
              name="Agua de Horchata"
              sales="180"
              amount="$7,200"
              percentage={30}
            />
            <TopItem
              name="Chapulines"
              sales="120"
              amount="$12,000"
              percentage={20}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

const VentasStatCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color,
}: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md group">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-2xl bg-gray-50 group-hover:bg-white transition-colors ${color}`}
      >
        <Icon size={24} strokeWidth={3} />
      </div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
          isPositive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-600"
        }`}
      >
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {change}
      </div>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
      {title}
    </p>
    <p className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
      {value}
    </p>
  </div>
);

const TopItem = ({ name, sales, amount, percentage }: any) => (
  <div className="flex items-center justify-between group cursor-default">
    <div className="flex-1 pr-4">
      <p className="text-sm font-black uppercase tracking-tight group-hover:text-[#FF8108] transition-colors truncate">
        {name}
      </p>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {sales} Ventas
      </p>
    </div>
    <div className="text-right w-32">
      <p className="text-sm font-black tabular-nums">{amount}</p>
      <div className="h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-[#FF8108] to-orange-400 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  </div>
);

export default VentasPage;
