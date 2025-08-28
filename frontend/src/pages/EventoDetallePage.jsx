import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

const EventoDetallePage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);

  const [evento, setEvento] = useState(null);
  const [inscripto, setInscripto] = useState(false);

  useEffect(() => {
    api.get(`/event/${id}`)
      .then((res) => setEvento(res.data))
      .catch(() => alert("Error al traer el detalle del evento"));
  }, [id]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get(`/event/${id}/enrollment`)
        .then((res) => setInscripto(res.data.enrolled))
        .catch((err) => {
          console.log("No se pudo verificar inscripción", err.response?.data || err.message);
        });
    }
  }, [id, isAuthenticated]);

  const handleInscribirse = async () => {
    try {
      await api.post(`/event/${id}/enrollment`);
      setInscripto(true);
    } catch {
      alert("Error al inscribirse");
    }
  };

  const handleCancelar = async () => {
    try {
      await api.delete(`/event/${id}/enrollment`);
      setInscripto(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al cancelar inscripción";
      alert(msg);
    }
  };

  if (!evento) return <div className="container"><div className="card">Cargando evento...</div></div>;

  const fecha = new Date(evento.start_date).toLocaleString("es-AR");

  return (
    <div className="container">
      <div className="card">
        <h1 className="page-title" style={{ marginTop: 0 }}>{evento.name}</h1>

        {evento.description && (
          <p className="card-subtle" style={{ marginTop: -6 }}>{evento.description}</p>
        )}

        <div className="grid" style={{gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 8}}>
          <div><strong>Fecha</strong><div className="mt-2">{fecha}</div></div>
          <div><strong>Duración</strong><div className="mt-2">{evento.duration_in_minutes} minutos</div></div>
          <div><strong>Precio</strong><div className="mt-2">${evento.price}</div></div>
          <div><strong>Categoría</strong><div className="mt-2">{evento.category_name}</div></div>
        </div>

        <div className="grid mt-3" style={{gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"}}>
          <div><strong>Ubicación</strong><div className="mt-2">{evento.location_name}</div></div>
          <div><strong>Dirección</strong><div className="mt-2">{evento.full_address}</div></div>
          <div><strong>Provincia</strong><div className="mt-2">{evento.province}</div></div>
          <div><strong>Localidad</strong><div className="mt-2">{evento.locality}</div></div>
        </div>

        <div className="mt-3">
          <strong>Tags</strong>
          <div className="card-actions mt-2">
            {evento.tags?.length ? (
              evento.tags.map((tag) => (
                <span key={tag.id} className="btn btn-outline" style={{ pointerEvents: 'none' }}>{tag.name}</span>
              ))
            ) : (
              <span className="text-muted">Sin etiquetas</span>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="card-actions" style={{ justifyContent: "flex-end" }}>
            {inscripto ? (
              <button className="btn btn-danger" onClick={handleCancelar}>Cancelar inscripción</button>
            ) : (
              <button className="btn btn-primary" onClick={handleInscribirse}>Inscribirme</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoDetallePage;
