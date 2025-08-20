import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/user/login", {
        username: email,
        password,
      });
      console.log("Login Response:", res.data);
      localStorage.setItem("token", res.data.token);
      login(res.data.token);
      navigate("/eventos");
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Error en login");
    }
  };
  
  return (
    <div className="container">
      <h1 className="page-title">Iniciar sesión</h1>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form className="card form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="card-actions" style={{ justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary">Ingresar</button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
