import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const EventoDetallePage = () => {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    api.get(`/event/${id}`)
      .then((res) => setEvento(res.data))
      .catch(() => alert("Error al traer detalle"));
  }, [id]);

  if (!evento) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{evento.name}</h1>
      <p>{evento.description}</p>
      <p>{evento.date}</p>
      <p>{evento.location_name}</p>
    </div>
  );
};

export default EventoDetallePage;
