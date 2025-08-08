import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/user/register", {
        first_name: firstName,
        last_name: lastName,
        username,
        password,
      });
      console.log(res.data);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Datos inválidos");
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Registro</h1>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form className="card form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="card-actions" style={{ justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary">Registrarse</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
