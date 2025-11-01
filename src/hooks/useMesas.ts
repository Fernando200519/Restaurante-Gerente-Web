// src/hooks/useMesas.ts
import { useEffect, useState } from "react";
import { getMesas } from "../api/mesasApi";
import { Mesa } from "../types/mesa";

export const useMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getMesas();
        if (mounted) setMesas(data);
      } catch (err) {
        console.error("Error cargando mesas", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { mesas, loading, setMesas };
};
