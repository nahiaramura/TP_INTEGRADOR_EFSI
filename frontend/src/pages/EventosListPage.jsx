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
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.upcoming) {
        params.append("upcoming", "1");
      }
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach((tag) => params.append("tag", tag));
      }
  
      const token = localStorage.getItem('token');
  
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};
  
      const res = await api.get(`/event?${params.toString()}`, { headers });
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
    <div className="container">
      <section className="hero">
        <h1 className="hero-title">
          <span className="gradient-text">Eventos</span> que inspiran
        </h1>
        <p className="hero-subtitle">Explora, filtra y descubre experiencias únicas. Diseñado con un estilo moderno y vibrante.</p>
        <div className="card-actions mt-3">
          <button className="btn btn-primary" onClick={() => { setPage(0); fetchEventos({}); }}>Explorar ahora</button>
          <button className="btn btn-outline" onClick={() => { setPage(0); fetchEventos({ upcoming: true }); }}>Ver próximos</button>
        </div>
      </section>

      <BuscadorEventos onFiltrar={handleFiltro} />

      <div className="list mt-3">
        {eventos.length === 0 ? (
          <div className="empty">No se encontraron eventos con los filtros seleccionados.</div>
        ) : (
          eventos.map((evento) => (
            <EventoCard key={evento.id} evento={evento} />
          ))
        )}
      </div>

      <div className="card-actions" style={{ justifyContent: "flex-end" }}>
        <button className="btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</button>
        <button className="btn btn-primary" onClick={() => setPage((p) => p + 1)}>Siguiente</button>
      </div>
    </div>
  );
  
};

export default EventosListPage;
