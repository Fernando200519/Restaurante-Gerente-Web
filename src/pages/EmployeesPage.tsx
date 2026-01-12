import React, { useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { useEmployees } from "../hooks/useEmployees";
import EmployeeStats from "../components/employees/EmployeeStats";
import EmployeeTable from "../components/employees/EmployeeTable";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";
import type { Employee, EmployeeFormData } from "../types/types";

const Employees: React.FC = () => {
  const {
    employees,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  return (
    <main className="w-full max-w-full animate-in fade-in duration-500">
      {/* 🏢 HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            Empleados
          </h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-3 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer bg-[#FF8108]"
        >
          <Plus size={20} strokeWidth={4} /> Agregar Empleado
        </button>
      </div>

      <EmployeeStats stats={stats} />

      {/* 🛠️ TOOLBAR DE BÚSQUEDA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 my-10">
        <div className="relative group max-w-xl">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF8108] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-4 focus:ring-orange-50 focus:border-[#FF8108] focus:bg-white outline-none transition-all font-bold text-gray-700"
          />
        </div>
      </div>

      {/* 📋 TABLA */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="bg-white rounded-[3rem] p-24 text-center flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#FF8108] mb-4" size={48} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
              Sincronizando nómina...
            </p>
          </div>
        ) : (
          <EmployeeTable employees={employees} onEdit={handleEditClick} />
        )}
      </div>

      {/* 📦 MODALES */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={createEmployee}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSave={(id, data) => {
          updateEmployee(id, data);
          setIsEditModalOpen(false);
        }}
        onDelete={(id) => {
          deleteEmployee(id);
          setIsEditModalOpen(false);
        }}
      />
    </main>
  );
};

export default Employees;
