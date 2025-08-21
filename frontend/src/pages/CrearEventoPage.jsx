import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import api from "../api/axios";

const CrearEventoPage = () => {
  const navigate = useNavigate(); 
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    duration_in_minutes: "",
    price: "",
    id_event_category: "",
    id_event_location: "",
    max_assistance: "", 
  });

  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, ubRes] = await Promise.all([
          api.get("/event-category"),
          api.get("/event-location"),
        ]);
        setCategorias(catRes.data.collection ?? catRes.data);
        setUbicaciones(ubRes.data.collection ?? ubRes.data);
      } catch (e) {
        console.error("Error cargando combos:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        duration_in_minutes: Number(form.duration_in_minutes),
        price: Number(form.price),
        id_event_category: Number(form.id_event_category),
        id_event_location: Number(form.id_event_location),
        max_assistance: Number(form.max_assistance),
      };

      const res = await api.post("/event", payload);

      alert("Evento creado con éxito!");

      setTimeout(() => {
        navigate("/mis-eventos"); 
      }, 1000);

    } catch (err) {
      console.error("Error al crear evento:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Error al crear evento");
    }
  };

  if (loading) return <div className="container p-6">Cargando…</div>;

  return (
    <div className="container">
      <h1 className="page-title">Crear Evento</h1>
      <form className="form card" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" required />
        <input name="start_date" value={form.start_date} onChange={handleChange} type="datetime-local" required />
        <input name="duration_in_minutes" value={form.duration_in_minutes} onChange={handleChange} type="number" placeholder="Duración (minutos)" min="0" required />
        <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" placeholder="Precio" min="0" required />
        <input name="max_assistance" value={form.max_assistance} onChange={handleChange} type="number" placeholder="Máxima asistencia" min="1" required />

        <select name="id_event_category" value={form.id_event_category} onChange={handleChange} required>
          <option value="">Seleccionar categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select name="id_event_location" value={form.id_event_location} onChange={handleChange} required>
          <option value="">Seleccionar ubicación</option>
          {ubicaciones.map((ub) => (
            <option key={ub.id} value={ub.id}>{ub.name}</option>
          ))}
        </select>

        <div className="card-actions">
          <button type="submit" className="btn btn-primary">Crear</button>
        </div>
      </form>
    </div>
  );
};

export default CrearEventoPage;
