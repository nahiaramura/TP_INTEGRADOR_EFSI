import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditarEventoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [error, setError] = useState("");

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

    fetchEvento();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/event/${id}`, {
        ...evento,
        start_date: new Date(evento.start_date).toISOString(), // aseguramos formato
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
          <label>Cupo máximo:</label>
          <input name="max_assistance" type="number" value={evento.max_assistance} onChange={handleChange} />
        </div>
        <div>
          <label>ID Categoría:</label>
          <input name="id_event_category" type="number" value={evento.id_event_category} onChange={handleChange} />
        </div>
        <div>
          <label>ID Ubicación:</label>
          <input name="id_event_location" type="number" value={evento.id_event_location} onChange={handleChange} />
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
