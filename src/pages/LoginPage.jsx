import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ Usamos el contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/user/login", {
        username: email,
        password,
      });
  
      console.log("Login Response:", res.data);
  
      // ✅ Guardamos el token en localStorage
      localStorage.setItem("token", res.data.token);
  
      // ✅ Seteamos token en el contexto (por si lo usás ahí también)
      login(res.data.token);
  
      // ✅ Redirigimos
      navigate("/eventos");
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Error en login");
    }
  };
  
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ color: "green" }}>Login Page</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default LoginPage;
