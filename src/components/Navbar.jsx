import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      <Link to="/">Inicio</Link>
      {isAuthenticated && (
        <>
          <Link to="/mis-eventos">Mis Eventos</Link>
          <Link to="/crear-evento">Crear Evento</Link>
          <Link to="/ubicaciones">Ubicaciones</Link>
          <button onClick={logout}>Cerrar sesión</button>
        </>
      )}
      {!isAuthenticated && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
