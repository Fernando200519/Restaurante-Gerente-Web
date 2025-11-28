import React from 'react';
import type { EmployeeStats as EmployeeStatsType } from '../../types/employees/types';

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  return (
    <div className="flex gap-4">
      <div className="text-sm text-gray-600">
        <span className="font-semibold">Meseros:</span> {stats.meseros}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">Cocineros:</span> {stats.cocineros}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">Cajeros:</span> {stats.cajeros}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">Asistencia:</span> {stats.asistencia}/{stats.total}
      </div>
    </div>
  );
};

export default EmployeeStats;

