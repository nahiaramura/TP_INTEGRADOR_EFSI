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
      alert("Error al cancelar inscripción");
    }
  };

  if (!evento) return <p>Cargando evento...</p>;

  const fecha = new Date(evento.start_date).toLocaleString("es-AR");

  return (
    <div style={{ padding: "20px" }}>
      <h1>{evento.name}</h1>
      <p><strong>Descripción:</strong> {evento.description}</p>
      <p><strong>Fecha:</strong> {fecha}</p>
      <p><strong>Duración:</strong> {evento.duration_in_minutes} minutos</p>
      <p><strong>Precio:</strong> ${evento.price}</p>
      <p><strong>Categoría:</strong> {evento.category_name}</p>
      <p><strong>Ubicación:</strong> {evento.location_name}</p>
      <p><strong>Dirección completa:</strong> {evento.full_address}</p>
      <p><strong>Provincia:</strong> {evento.province}</p>
      <p><strong>Localidad:</strong> {evento.locality}</p>
      <p><strong>Creado por:</strong> {evento.creator_name}</p>

      <p><strong>Tags:</strong> {evento.tags?.map(tag => tag.name).join(", ")}</p>

      {isAuthenticated && (
        <div style={{ marginTop: "20px" }}>
          {inscripto ? (
            <button onClick={handleCancelar}>Cancelar inscripción</button>
          ) : (
            <button onClick={handleInscribirse}>Inscribirme</button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventoDetallePage;
