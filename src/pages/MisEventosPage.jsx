import { useEffect, useState } from "react";
import api from "../api/axios";

const MisEventosPage = () => {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get("/event/mine");
        console.log("Eventos recibidos:", response.data);
        setEventos(response.data.collection); // ✅ usamos la propiedad correcta
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
    } catch (err) {
      console.error("Error al eliminar evento:", err);
    }
  };

  const handleEditar = (id) => {
    window.location.href = `/editar-evento/${id}`;
  };

  const handleCrearEventoTest = async () => {
    try {
      await api.post("/event", {
        name: "Evento de prueba",
        description: "Este es un evento de prueba creado desde el botón",
        id_event_category: 1,
        id_event_location: 1,
        start_date: new Date().toISOString(),
        duration_in_minutes: 60,
        price: 0,
        enabled_for_enrollment: true,
        max_assistance: 20,
      });

      // Refrescar eventos luego de crear
      const response = await api.get("/event/mine");
      setEventos(response.data.collection);
    } catch (err) {
      console.error("Error al crear evento de prueba:", err);
      setError("Error al crear evento de prueba.");
    }
  };

  return (
    <div>
      <h1>Mis Eventos</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleCrearEventoTest}>
        Crear evento de prueba
      </button>

      {!error && eventos.length === 0 ? (
        <p>No tienes eventos creados aún.</p>
      ) : (
        <ul>
          {eventos.map((evento) => (
            <li key={evento.id}>
              <strong>{evento.name}</strong> - {new Date(evento.start_date).toLocaleString()}
              <br />
              <button onClick={() => handleEditar(evento.id)}>Editar</button>
              <button onClick={() => handleEliminar(evento.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisEventosPage;
