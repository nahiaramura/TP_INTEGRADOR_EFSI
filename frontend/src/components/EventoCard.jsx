import { Link } from "react-router-dom";

const EventoCard = ({ evento }) => {
  return (
    <div className="card">
      <h3 className="card-title">{evento.name}</h3>
      {evento.description && <p className="card-subtle">{evento.description}</p>}
      <div className="text-muted">{evento.date}</div>
      {evento.location_name && <div className="mt-2">📍 {evento.location_name}</div>}
      <div className="card-actions">
        <Link className="btn btn-outline" to={`/eventos/${evento.id}`}>Ver detalle</Link>
      </div>
    </div>
  );
};

export default EventoCard;
