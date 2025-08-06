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

  return (
    <div>
      <h1>Mis Eventos</h1>

      {mensajeEliminar && (
        <p style={{ color: "red", marginTop: "10px" }}>{mensajeEliminar}</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

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
