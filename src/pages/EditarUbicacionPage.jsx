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

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div>
      <h1>Editar Ubicación</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nombre" required />
        <input type="text" name="full_address" value={form.full_address} onChange={handleChange} placeholder="Dirección" required />
        <input type="number" name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitud" />
        <input type="number" name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitud" />
        <input type="number" name="id_location" value={form.id_location} onChange={handleChange} placeholder="ID de localidad" required />
        <input type="number" name="max_capacity" value={form.max_capacity} onChange={handleChange} placeholder="Capacidad máxima" required />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default EditarUbicacionPage;
