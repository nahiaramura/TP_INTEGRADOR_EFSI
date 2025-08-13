import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditarEventoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [error, setError] = useState("");
  const [ubicaciones, setUbicaciones] = useState([]);

  

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const res = await api.get(`/event/${id}`);
        setEvento(res.data);
      } catch (err) {
        console.error("Error al cargar evento:", err);
        setError("No se pudo cargar el evento.");
      }
    };
  
    const fetchUbicaciones = async () => {
      try {
        const res = await api.get("/event-location");
        setUbicaciones(res.data);
      } catch (err) {
        console.error("Error al cargar ubicaciones:", err);
      }
    };
  
    fetchEvento();
    fetchUbicaciones();
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value, type } = e.target;
  
    let parsedValue = value;
  
    if (type === "number") {
      parsedValue = parseFloat(value);
    }
  
    if (name === "enabled_for_enrollment") {
      parsedValue = value === "true";
    }
  
    setEvento((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    const requiredFields = [
      "name",
      "description",
      "start_date",
      "duration_in_minutes",
      "price",
      "max_assistance",
      "id_event_category",
      "id_event_location"
    ];
  
    for (let field of requiredFields) {
      if (
        evento[field] === undefined ||
        evento[field] === null ||
        evento[field].toString().trim() === ""
      ) {
        setError(`El campo "${field}" es obligatorio.`);
        return;
      }
    }
    const ubicacionSeleccionada = ubicaciones.find(
      (u) => u.id == evento.id_event_location
    );
    if (
      ubicacionSeleccionada &&
      evento.max_assistance > ubicacionSeleccionada.max_capacity
    ) {
      setError(
        `El cupo máximo (${evento.max_assistance}) no puede superar la capacidad del lugar (${ubicacionSeleccionada.max_capacity}).`
      );
      return;
    }
    
    try {
      await api.put(`/event/${id}`, {
        ...evento,
        start_date: new Date(evento.start_date).toISOString(),
        duration_in_minutes: parseInt(evento.duration_in_minutes),
        price: parseFloat(evento.price),
        max_assistance: parseInt(evento.max_assistance),
      });
  
      navigate("/mis-eventos");
    } catch (err) {
      console.error("Error al actualizar el evento:", err);
      setError("Error al actualizar el evento.");
    }
  };
  

  if (!evento) return <p>Cargando evento...</p>;

  return (
    <div>
      <h1>Editar Evento</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input name="name" value={evento.name} onChange={handleChange} />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea name="description" value={evento.description} onChange={handleChange} />
        </div>
        <div>
          <label>Fecha de inicio:</label>
          <input type="datetime-local" name="start_date" value={evento.start_date.slice(0, 16)} onChange={handleChange} />
        </div>
        <div>
          <label>Duración (minutos):</label>
          <input name="duration_in_minutes" type="number" value={evento.duration_in_minutes} onChange={handleChange} />
        </div>
        <div>
          <label>Precio:</label>
          <input name="price" type="number" step="0.01" value={evento.price} onChange={handleChange} />
        </div>
        <div>
          <label>Cupo máximo: </label>
          <input name="max_assistance" type="number" value={evento.max_assistance} onChange={handleChange} />
        </div>
        <div>
          <label>ID Categoría:</label>
          <input name="id_event_category" type="number" value={evento.id_event_category} onChange={handleChange} />
        </div>
        <div>
  <label>Ubicación:</label>
  <select
    name="id_event_location"
    value={evento.id_event_location}
    onChange={handleChange}
  >
    <option value="">Seleccione una ubicación</option>
    {ubicaciones.map((u) => (
      <option key={u.id} value={u.id}>
        {u.name}
      </option>
    ))}
  </select>
  {evento.id_event_location && (
    <p style={{ fontSize: "0.9rem", color: "#555" }}>
      Capacidad del lugar: {
        ubicaciones.find(u => u.id == evento.id_event_location)?.max_capacity
      }
    </p>
  )}
</div>

        <div>
          <label>Habilitado para inscripción:</label>
          <select name="enabled_for_enrollment" value={evento.enabled_for_enrollment} onChange={handleChange}>
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </div>

        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
};

export default EditarEventoPage;
