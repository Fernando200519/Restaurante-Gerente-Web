import { useState, useMemo, useEffect, useCallback } from "react";
import { employeesAPI } from "../api/employeesApi";
import type {
  Employee,
  EmployeeFormData,
  EmployeeStats,
} from "../types/employee";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeesAPI.getAll(); //
      setEmployees(data);
    } catch (err) {
      setError("No se pudo cargar la lista de colaboradores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const stats: EmployeeStats = useMemo(() => {
    return {
      meseros: employees.filter((e) => e.role === "mesero").length,
      cocineros: employees.filter((e) => e.role === "cocinero").length,
      cajeros: employees.filter((e) => e.role === "cajero").length,
      asistencia: employees.filter((e) => e.status === "activo").length,
      total: employees.length,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.username.toLowerCase().includes(term) ||
        emp.phone.includes(term)
    );
  }, [employees, searchTerm]);

  const createEmployee = async (data: EmployeeFormData) => {
    await employeesAPI.create(data);
    await loadEmployees();
  };

  const updateEmployee = async (id: string, data: any) => {
    await employeesAPI.update(id, data);
    await loadEmployees();
  };

  const deleteEmployee = async (id: string) => {
    await employeesAPI.delete(id);
    await loadEmployees();
  };

  return {
    employees: filteredEmployees,
    loading,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refresh: loadEmployees,
  };
};
