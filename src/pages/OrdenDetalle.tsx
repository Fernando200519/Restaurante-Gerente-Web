// src/pages/OrdenDetalle.tsx
import React from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";

const OrdenDetalle: React.FC = () => {
  const { id } = useParams();
  return (
    <Layout pageTitle={`Orden ${id ?? ""}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">
          Detalle de la orden ({id})
        </h2>
        <p>Página en construcción. Aquí mostrarás la orden completa pronto.</p>
      </div>
    </Layout>
  );
};

export default OrdenDetalle;
