import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const toArray = (p) => {
  const d = p?.data ?? p;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.collection)) return d.collection;
  return [];
};

const toInputLocal = (s) => {
  if (!s) return "";
  const str = String(s).replace("T", " ").trim();
  const m = str.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})/);
  return m ? `${m[1]}T${m[2]}:${m[3]}` : "";
};

const toPgTimestampLocal = (val) => {
  if (!val) return null;
  if (val.includes("T")) {
    const [d, t] = val.split("T");
    return `${d} ${t.length === 5 ? `${t}:00` : t}`;
  }
  return val;
};

const toIntOrNull = (v) =>
  v === "" || v === undefined || v === null ? null : Number.parseInt(v, 10);

export default function EditarEventoPage() {
  const { id } = useParams();
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
    enabled_for_enrollment: false,
  });

  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [catRes, ubRes] = await Promise.all([
          api.get("/event-category"),
          api.get("/event-location"),
        ]);
        if (!mounted) return;
        setCategorias(toArray(catRes.data));
        setUbicaciones(toArray(ubRes.data));
      } catch (e) {
        console.error("Error cargando combos:", e);
      }
    })();

    (async () => {
      try {
        const ev = await api.get(`/event/${id}`);
        if (!mounted) return;
        setForm({
          name: ev.data.name ?? "",
          description: ev.data.description ?? "",
          start_date: toInputLocal(ev.data.start_date),
          duration_in_minutes:
            ev.data.duration_in_minutes != null ? String(ev.data.duration_in_minutes) : "",
          price: ev.data.price != null ? String(ev.data.price) : "",
          id_event_category:
            ev.data.id_event_category != null ? String(ev.data.id_event_category) : "",
          id_event_location:
            ev.data.id_event_location != null ? String(ev.data.id_event_location) : "",
          max_assistance:
            ev.data.max_assistance != null ? String(ev.data.max_assistance) : "",
          enabled_for_enrollment: !!ev.data.enabled_for_enrollment,
        });
      } catch (e) {
        console.error("Error cargando detalle:", e);
        alert("No se pudo cargar el evento.");
        navigate(-1);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      start_date: toPgTimestampLocal(form.start_date),
      duration_in_minutes: toIntOrNull(form.duration_in_minutes),
      price: form.price === "" ? 0 : Number.parseFloat(form.price),
      id_event_category: toIntOrNull(form.id_event_category),
      id_event_location: toIntOrNull(form.id_event_location),
      max_assistance:
        toIntOrNull(form.max_assistance) === null ? 0 : toIntOrNull(form.max_assistance),
      enabled_for_enrollment: !!form.enabled_for_enrollment,
    };

    try {
      await api.put(`/event/${id}`, payload);
      alert("Evento actualizado");
      navigate("/mis-eventos");
    } catch (err) {
      console.error("Error al actualizar evento:", err?.response?.data || err);
      alert(err?.response?.data?.message || err?.response?.data?.error || "Error al actualizar");
    }
  };

  if (loading) return <div className="container p-6">Cargando…</div>;

  return (
    <div className="container">
      <h1 className="page-title">Editar Evento</h1>
      <form className="form card" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" required />

        <input
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          type="datetime-local"
          required
        />

        <input
          name="duration_in_minutes"
          value={form.duration_in_minutes}
          onChange={handleChange}
          type="number"
          placeholder="Duración (minutos)"
          min="0"
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          type="number"
          step="0.01"
          placeholder="Precio"
          min="0"
        />

        <select
          name="id_event_category"
          value={form.id_event_category}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          name="id_event_location"
          value={form.id_event_location}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar ubicación</option>
          {toArray(ubicaciones).map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          name="max_assistance"
          value={form.max_assistance}
          onChange={handleChange}
          type="number"
          placeholder="Cupo máximo"
          min="0"
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            name="enabled_for_enrollment"
            checked={form.enabled_for_enrollment}
            onChange={handleChange}
          />
          Habilitar inscripción
        </label>

        <div className="card-actions">
          <button type="submit" className="btn btn-primary">Guardar</button>
        </div>
      </form>
    </div>
  );
}
