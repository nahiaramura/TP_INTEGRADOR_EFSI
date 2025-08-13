import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // cliente Axios con token automático

const CrearUbicacionPage = () => {
  const [name, setName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get("/locations"); // asegúrate que este endpoint exista y devuelva [{ id, name }]
        setLocations(res.data);
      } catch (error) {
        console.error("Error al obtener localidades:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    try {
      await api.post("/event-location", {
        name,
        full_address: fullAddress,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        id_location: parseInt(selectedLocationId),
        max_capacity: parseInt(maxCapacity),
      });

      alert("Ubicación creada con éxito");
      navigate("/ubicaciones");
    } catch (error) {
      console.error("Error al crear ubicación:", error);
      alert(error?.response?.data?.error || "Error al crear ubicación");
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

          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            <div className="form-row">
              <label>Latitud (opcional)</label>
              <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Longitud (opcional)</label>
              <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
          </div>

          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            <div className="form-row">
              <label>Localidad</label>
              <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} required>
                <option value="">Seleccione una localidad</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Capacidad máxima</label>
              <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} required />
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
