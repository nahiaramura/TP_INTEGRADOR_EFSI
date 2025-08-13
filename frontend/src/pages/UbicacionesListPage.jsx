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
        }        
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
        }        
      });
      alert("Ubicación eliminada correctamente");
      fetchUbicaciones(); // refresca la lista
    } catch (err) {
      console.error(err);
      alert("Error al eliminar ubicación");
    }
  };

  return (
    <div className="container">
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12}}>
        <h1 className="page-title">Ubicaciones</h1>
        <button className="btn btn-primary" onClick={() => navigate("/crear-ubicacion")}>Crear nueva ubicación</button>
      </div>

      {loading ? (
        <div className="empty">Cargando ubicaciones...</div>
      ) : ubicaciones.length === 0 ? (
        <div className="empty">No tenés ubicaciones creadas.</div>
      ) : (
        <div className="grid mt-3">
          {ubicaciones.map((ubic) => (
            <div key={ubic.id} className="card">
              <div className="card-title">{ubic.name}</div>
              <div className="card-subtle">Capacidad máxima: {ubic.max_capacity}</div>
              {ubic.full_address && (
                <div className="text-muted">{ubic.full_address}</div>
              )}
              <div className="card-actions">
                <button className="btn btn-outline" onClick={() => handleEditar(ubic.id)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleEliminar(ubic.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UbicacionesListPage;
