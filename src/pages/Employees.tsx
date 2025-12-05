// src/pages/employees/Employees.tsx
import React, { useState, useMemo, useEffect } from "react";

import EmployeeStats from "../components/employees/EmployeeStats";
import SearchBar from "../components/employees/SearchBar";
import AddEmployeeButton from "../components/employees/AddEmployeeButton";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";
import EmployeeTable from "../components/employees/EmployeeTable";

import { employeesAPI } from "../api/employees";
import type {
  Employee,
  EmployeeStats as EmployeeStatsType,
  EmployeeFormData,
} from "../types/types";

const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeesAPI.getAll();
      setEmployees(data);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      setError("Error al cargar los empleados.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.username.toLowerCase().includes(term) ||
        emp.phone.includes(term)
    );
  }, [employees, searchTerm]);

  const stats: EmployeeStatsType = useMemo(() => {
    const meseros = employees.filter((e) => e.role === "mesero").length;
    const cocineros = employees.filter((e) => e.role === "cocinero").length;
    const cajeros = employees.filter((e) => e.role === "cajero").length;
    const activos = employees.filter((e) => e.status === "activo").length;
    const total = employees.length;

    return { meseros, cocineros, cajeros, asistencia: activos, total };
  }, [employees]);

  const handleAddEmployee = () => setIsAddModalOpen(true);

  const handleSaveEmployee = async (formData: EmployeeFormData) => {
    try {
      setError(null);
      await employeesAPI.create(formData);
      await loadEmployees();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      setError("Error al crear el empleado.");
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleSaveEmployeeEdit = async (
    employeeId: string,
    data: { role: Employee["role"]; username: string; phone: string }
  ) => {
    try {
      setError(null);
      const originalEmployee = employees.find((emp) => emp.id === employeeId);
      if (!originalEmployee) return;

      const updateData: any = {};
      if (data.role !== originalEmployee.role) updateData.role = data.role;
      if (data.username !== originalEmployee.username)
        updateData.username = data.username;
      if (data.phone !== originalEmployee.phone) updateData.phone = data.phone;

      if (Object.keys(updateData).length > 0) {
        await employeesAPI.update(employeeId, updateData);
        await loadEmployees();
      }
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar.");
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      setError(null);
      await employeesAPI.delete(employeeId);
      await loadEmployees();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar.");
    }
  };

  return (
    <>
      <div className="max-w-full">
        {/* Título y estadísticas */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Empleados</h1>
          <EmployeeStats stats={stats} />
        </div>

        {/* Barra de búsqueda y botón agregar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>
          <AddEmployeeButton onClick={handleAddEmployee} />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tabla de empleados */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Cargando empleados...</p>
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            onEdit={handleEditEmployee}
          />
        )}
      </div>

      {/* Modales*/}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveEmployee}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSave={handleSaveEmployeeEdit}
        onDelete={handleDeleteEmployee}
      />
    </>
  );
};

export default Employees;
