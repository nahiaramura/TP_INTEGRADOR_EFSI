import { useState, useEffect } from "react";
import api from "../api/axios";

const CrearEventoPage = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    duration_in_minutes: "",
    price: "",
    id_event_category: "",
    id_event_location: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    // Cargar categorías
    api.get("/event-category")
      .then(res => setCategorias(res.data))
      .catch(err => console.error("Error al cargar categorías", err));

    // Cargar ubicaciones del usuario autenticado
    api.get("/event-location")
      .then(res => setUbicaciones(res.data))
      .catch(err => console.error("Error al cargar ubicaciones", err));
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/event", {
        ...form,
        price: parseFloat(form.price),
        duration_in_minutes: parseInt(form.duration_in_minutes),
        id_event_category: parseInt(form.id_event_category),
        id_event_location: parseInt(form.id_event_location),
      });
      alert("Evento creado con éxito");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al crear evento");
    }
  };

  return (
    <div>
      <h1>Crear Evento</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required /><br/>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" required /><br/>
        
        <input name="start_date" value={form.start_date} onChange={handleChange} type="datetime-local" required /><br/>
        <input name="duration_in_minutes" value={form.duration_in_minutes} onChange={handleChange} type="number" placeholder="Duración (minutos)" required /><br/>
        <input name="price" value={form.price} onChange={handleChange} type="number" placeholder="Precio" required /><br/>

        <select name="id_event_category" value={form.id_event_category} onChange={handleChange} required>
          <option value="">Seleccionar categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select><br/>

        <select name="id_event_location" value={form.id_event_location} onChange={handleChange} required>
          <option value="">Seleccionar ubicación</option>
          {ubicaciones.map(ub => (
            <option key={ub.id} value={ub.id}>{ub.name}</option>
          ))}
        </select><br/>

        <button type="submit">Crear</button>
      </form>
    </div>
  );
};

export default CrearEventoPage;
