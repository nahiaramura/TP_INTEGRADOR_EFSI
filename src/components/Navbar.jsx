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
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <div className="brand-badge"><span>EV</span></div>
          <Link to="/eventos">Eventos</Link>
        </div>

        <nav className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/crear-evento">Crear Evento</Link>
              <Link to="/mis-eventos">Mis Eventos</Link>
              <Link to="/ubicaciones">Ubicaciones</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registrarse</Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <button className="btn btn-outline" onClick={handleLogout}>Cerrar sesión</button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
