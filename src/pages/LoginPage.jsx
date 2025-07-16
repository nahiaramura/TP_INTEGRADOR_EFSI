import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post("/user/login", {
            username: email, // 👈 este es el nombre correcto del campo
            password,
          });          
      console.log("Login Response:", res.data);
      localStorage.setItem("token", res.data.token);
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
