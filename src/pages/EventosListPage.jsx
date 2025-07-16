import { useEffect, useState } from "react";
import api from "../api/axios";
import EventoCard from "../components/EventoCard";
import BuscadorEventos from "../components/BuscadorEventos";

const EventosListPage = () => {
  const [eventos, setEventos] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 5;

  const fetchEventos = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit);
      params.append("offset", page * limit);

      if (filters.name) {
        params.append("name", filters.name);
      }
      if (filters.startdate) {
        params.append("startdate", filters.startdate);
      }
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach((tag) => params.append("tag", tag));
      }

      const res = await api.get(`/event?${params.toString()}`);
      setEventos(res.data.collection || []);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [page]);

  const handleFiltro = (filtros) => {
    setPage(0);
    fetchEventos(filtros);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Eventos</h1>
      <BuscadorEventos onFiltrar={handleFiltro} />
      
      {eventos.length === 0 ? (
        <p>No se encontraron eventos con los filtros seleccionados.</p>
      ) : (
        eventos.map((evento) => (
          <EventoCard key={evento.id} evento={evento} />
        ))
      )}
  
      <div style={{ marginTop: "10px" }}>
        <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</button>
        <button onClick={() => setPage((p) => p + 1)}>Siguiente</button>
      </div>
    </div>
  );
  
};

export default EventosListPage;
