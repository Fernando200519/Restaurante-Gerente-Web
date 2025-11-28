import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import EmployeeStats from '../../components/employees/EmployeeStats';
import SearchBar from '../../components/employees/SearchBar';
import AddEmployeeButton from '../../components/employees/AddEmployeeButton';
import AddEmployeeModal from '../../components/employees/AddEmployeeModal';
import EditEmployeeModal from '../../components/employees/EditEmployeeModal';
import EmployeeTable from '../../components/employees/EmployeeTable';
import { employeesAPI } from '../../api/employees';
import type { Employee, EmployeeStats as EmployeeStatsType, EmployeeFormData } from '../../types/employees/types';

// Mock data basado en la captura de pantalla
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Pedro Alonso',
    username: 'pirer1912@example.com',
    phone: '9213033285',
    role: 'mesero',
    status: 'activo',
  },
  {
    id: '2',
    name: 'Ricardo Lopez',
    username: 'rick123@example.com',
    phone: '9211686979',
    role: 'mesero',
    status: 'activo',
  },
  {
    id: '3',
    name: 'Salvador Martí...',
    username: 'chava69@example.com',
    phone: '9222002037',
    role: 'mesero',
    status: 'activo',
  },
];

const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar empleados al montar el componente
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
      console.error('Error al cargar empleados:', err);
      setError('Error al cargar los empleados. Por favor, intenta de nuevo.');
      // En caso de error, usar datos mock como fallback
      setEmployees(mockEmployees);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empleados según búsqueda
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

  // Calcular estadísticas
  const stats: EmployeeStatsType = useMemo(() => {
    const meseros = employees.filter((e) => e.role === 'mesero').length;
    const cocineros = employees.filter((e) => e.role === 'cocinero').length;
    const cajeros = employees.filter((e) => e.role === 'cajero').length;
    const activos = employees.filter((e) => e.status === 'activo').length;
    const total = employees.length;

    return {
      meseros,
      cocineros,
      cajeros,
      asistencia: activos,
      total,
    };
  }, [employees]);

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = async (formData: EmployeeFormData) => {
    try {
      setError(null);
      const newEmployee = await employeesAPI.create(formData);
      // Recargar la lista completa para asegurar que tenemos todos los datos actualizados
      await loadEmployees();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error al crear empleado:', err);
      setError('Error al crear el empleado. Por favor, intenta de nuevo.');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleSaveEmployeeEdit = async (
    employeeId: string,
    data: { role: Employee['role']; username: string; phone: string }
  ) => {
    try {
      setError(null);
      
      // Encontrar el empleado original para comparar valores
      const originalEmployee = employees.find((emp) => emp.id === employeeId);
      if (!originalEmployee) {
        setError('No se encontró el empleado a actualizar.');
        return;
      }
      
      // Preparar los datos para la API - solo incluir campos que cambiaron
      const updateData: Partial<EmployeeFormData> & { username?: string; phone?: string } = {};
      
      // Solo incluir role si cambió
      if (data.role !== originalEmployee.role) {
        updateData.role = data.role;
      }
      
      // Solo incluir username si cambió (evitar error del backend por correo igual)
      if (data.username !== originalEmployee.username) {
        updateData.username = data.username;
      }
      
      // Solo incluir phone si cambió
      if (data.phone !== originalEmployee.phone) {
        updateData.phone = data.phone;
      }
      
      // Solo hacer la actualización si hay algo que cambiar
      if (Object.keys(updateData).length > 0) {
        await employeesAPI.update(employeeId, updateData);
        // Recargar la lista completa para asegurar que tenemos todos los datos actualizados
        await loadEmployees();
      }
      
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Error al actualizar empleado:', err);
      setError('Error al actualizar el empleado. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      setError(null);
      await employeesAPI.delete(employeeId);
      // Recargar la lista completa para asegurar que tenemos todos los datos actualizados
      await loadEmployees();
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
      setError('Error al eliminar el empleado. Por favor, intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-6">
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
              <EmployeeTable employees={filteredEmployees} onEdit={handleEditEmployee} />
            )}
          </div>
        </main>
      </div>

      {/* Modal para agregar empleado */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveEmployee}
      />

      {/* Modal para editar empleado */}
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
    </div>
  );
};

export default Employees;

