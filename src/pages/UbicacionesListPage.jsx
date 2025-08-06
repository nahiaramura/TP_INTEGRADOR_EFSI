import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UbicacionesListPage = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUbicaciones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/event-location", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Ubicaciones recibidas:", response.data);

      // Adaptativo: soporta backend con o sin "collection"
      const data = response.data?.collection ?? response.data;

      // Validación final
      if (Array.isArray(data)) {
        setUbicaciones(data);
      } else {
        console.error("La respuesta no es un array de ubicaciones:", data);
        setUbicaciones([]);
      }

    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
      alert("Error al obtener las ubicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  const handleEditar = (id) => {
    navigate(`/editar-ubicacion/${id}`);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar esta ubicación?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3001/api/event-location/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Ubicación eliminada correctamente");
      fetchUbicaciones(); // refresca la lista
    } catch (err) {
      console.error(err);
      alert("Error al eliminar ubicación");
    }
  };

  return (
    <div>
      <h1>Ubicaciones</h1>

      <button onClick={() => navigate("/crear-ubicacion")}>
        Crear nueva ubicación
      </button>

      {loading ? (
        <p>Cargando ubicaciones...</p>
      ) : ubicaciones.length === 0 ? (
        <p>No tenés ubicaciones creadas.</p>
      ) : (
        <ul>
          {ubicaciones.map((ubic) => (
            <li key={ubic.id}>
              <strong>{ubic.name}</strong><br />
              Capacidad máxima: {ubic.max_capacity}
              <div style={{ marginTop: "5px" }}>
                <button onClick={() => handleEditar(ubic.id)}>Editar</button>{" "}
                <button onClick={() => handleEliminar(ubic.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UbicacionesListPage;
