import { useEffect, useState } from "react";
import api from "../api/axios";

const MisEventosPage = () => {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState("");
  const [mensajeEliminar, setMensajeEliminar] = useState("");

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get("/event/mine");
        console.log("Eventos recibidos:", response.data);
        setEventos(response.data.collection);
      } catch (err) {
        setError("No se pudieron cargar tus eventos.");
        console.error(err);
      }
    };

    fetchEventos();
  }, []);

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/event/${id}`);
      setEventos((prev) => prev.filter((e) => e.id !== id));
      setMensajeEliminar("");
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      const mensaje = err.response?.data?.message || "Error al eliminar el evento.";
      setMensajeEliminar(mensaje);
    }
  };

  const handleEditar = (id) => {
    window.location.href = `/editar-evento/${id}`;
  };

  const handleDesinscribirme = async (id) => {
    try {
      await api.delete(`/event/${id}/enrollment`);
      // Refrescar listado por si cambia el estado mostrado
      setEventos((prev) => prev.map(e => e.id === id ? { ...e, enrolled: false } : e));
      setMensajeEliminar("");
    } catch (err) {
      const mensaje = err.response?.data?.message || "No se pudo cancelar la inscripción.";
      setMensajeEliminar(mensaje);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Mis eventos</h1>

      {mensajeEliminar && (
        <div className="alert alert-danger" style={{ marginTop: 10 }}>{mensajeEliminar}</div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && eventos.length === 0 ? (
        <div className="empty">No tienes eventos creados aún.</div>
      ) : (
        <div className="list">
          {eventos.map((evento) => (
            <div className="card" key={evento.id}>
              <h3 className="card-title">{evento.name}</h3>
              <div className="card-subtle">{new Date(evento.start_date).toLocaleString()}</div>
              {evento.location_name && <div className="mt-2">📍 {evento.location_name}</div>}
              <div className="card-actions" style={{ justifyContent: "space-between" }}>
                <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  <button className="btn" onClick={() => handleEditar(evento.id)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => handleEliminar(evento.id)}>Eliminar</button>
                </div>
                <button className="btn btn-outline" onClick={() => handleDesinscribirme(evento.id)}>Desinscribirme</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisEventosPage;
