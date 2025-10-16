import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Panel del Gerente</h1>
      <p className="text-gray-600 mt-2">
        Bienvenido al sistema de gestión del restaurante.
      </p>
      <button className="bg-primary text-white px-4 py-2 rounded-lg">
        Boton
      </button>
    </div>
  );
};

export default Dashboard;
