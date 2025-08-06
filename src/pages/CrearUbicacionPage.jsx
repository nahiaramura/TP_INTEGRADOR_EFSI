import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CrearUbicacionPage = () => {
  const [name, setName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [idLocation, setIdLocation] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3001/api/event-location",
        {
          name,
          full_address: fullAddress,
          latitude: latitude || null,
          longitude: longitude || null,
          id_location: parseInt(idLocation),
          max_capacity: parseInt(maxCapacity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ubicación creada con éxito");
      navigate("/ubicaciones");
    } catch (error) {
      console.error("Error al crear ubicación:", error);
      alert(error?.response?.data?.error || "Error al crear ubicación");
    }
  };

  return (
    <div>
      <h1>Crear Nueva Ubicación</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label>Dirección completa:</label>
          <input value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required />
        </div>

        <div>
          <label>Latitud (opcional):</label>
          <input value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>

        <div>
          <label>Longitud (opcional):</label>
          <input value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>

        <div>
          <label>ID de localidad (id_location):</label>
          <input
            type="number"
            value={idLocation}
            onChange={(e) => setIdLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Capacidad máxima:</label>
          <input
            type="number"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            required
          />
        </div>

        <button type="submit">Crear</button>
      </form>
    </div>
  );
};

export default CrearUbicacionPage;
