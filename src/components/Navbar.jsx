import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      backgroundColor: "#f9f9f9",
      borderBottom: "1px solid #ddd",
      padding: "1rem",
      display: "flex",
      gap: "1rem"
    }}>
      <Link to="/eventos">Inicio</Link>

      {isAuthenticated && (
        <>
          <Link to="/crear-evento">Crear Evento</Link>
          <Link to="/mis-eventos">Mis Eventos</Link>
          <Link to="/ubicaciones">Ubicaciones</Link>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      )}

      {!isAuthenticated && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Registrarse</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
