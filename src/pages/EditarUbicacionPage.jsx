// src/pages/EditarUbicacionPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditarUbicacionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    full_address: "",
    latitude: "",
    longitude: "",
    id_location: "",
    max_capacity: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUbicacion = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3001/api/event-location/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(response.data);
      } catch (err) {
        console.error(err);
        alert("Error al cargar los datos de la ubicación.");
      } finally {
        setLoading(false);
      }
    };

    fetchUbicacion();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3001/api/event-location/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Ubicación actualizada correctamente");
      navigate("/ubicaciones");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la ubicación.");
    }
  };

  if (loading) return <div className="container"><div className="empty">Cargando datos...</div></div>;

  return (
    <div className="container">
      <h1 className="page-title">Editar Ubicación</h1>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Nombre</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Dirección</label>
            <input type="text" name="full_address" value={form.full_address} onChange={handleChange} required />
          </div>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            <div className="form-row">
              <label>Latitud</label>
              <input type="number" name="latitude" value={form.latitude} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Longitud</label>
              <input type="number" name="longitude" value={form.longitude} onChange={handleChange} />
            </div>
          </div>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            <div className="form-row">
              <label>ID de localidad</label>
              <input type="number" name="id_location" value={form.id_location} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <label>Capacidad máxima</label>
              <input type="number" name="max_capacity" value={form.max_capacity} onChange={handleChange} required />
            </div>
          </div>
          <div className="card-actions">
            <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>Cancelar</button>
            <button className="btn btn-primary" type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarUbicacionPage;
