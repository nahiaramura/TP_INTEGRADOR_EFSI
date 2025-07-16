import { Link } from "react-router-dom";

const EventoCard = ({ evento }) => {
  return (
    <div style={{ border: "1px solid #ddd", padding: "10px", margin: "10px 0" }}>
      <h2>{evento.name}</h2>
      <p>{evento.description}</p>
      <p>{evento.date}</p>
      <p>{evento.location_name}</p>
      <Link to={`/eventos/${evento.id}`}>Ver detalle</Link>
    </div>
  );
};

export default EventoCard;
