import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CrearUbicacionPage = () => {
  const [name, setName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [locationId, setLocationId] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationId || Number.isNaN(parseInt(locationId, 10))) {
      alert("Ingresá un ID de localidad válido.");
      return;
    }
    if (!maxCapacity || parseInt(maxCapacity, 10) <= 0) {
      alert("Capacidad máxima debe ser > 0.");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    try {
      await api.post("/event-location", {
        name: name.trim(),
        full_address: fullAddress.trim(),
        latitude: Number.isNaN(lat) ? null : lat,
        longitude: Number.isNaN(lng) ? null : lng,
        id_location: parseInt(locationId, 10),     
        max_capacity: parseInt(maxCapacity, 10),
      });

      alert("Ubicación creada con éxito");
      navigate("/ubicaciones");
    } catch (error) {
      console.error("Error al crear ubicación:", error);
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al crear ubicación"
      );
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Crear Nueva Ubicación</h1>
      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-row">
            <label>Dirección completa</label>
            <input value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required />
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <div className="form-row">
              <label>Latitud (opcional)</label>
              <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Longitud (opcional)</label>
              <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <div className="form-row">
              <label>ID de localidad (obligatorio)</label>
              <input
                type="number"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="Ej: 1"
                required
              />
              <small>Ingresá el número de la localidad (tabla <code>locations</code>).</small>
            </div>

            <div className="form-row">
              <label>Capacidad máxima</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          <div className="card-actions">
            <button className="btn btn-outline" type="button" onClick={() => navigate(-1)}>Cancelar</button>
            <button className="btn btn-primary" type="submit">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearUbicacionPage;
