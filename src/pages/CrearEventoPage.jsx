import { useState } from "react";
import api from "../api/axios";

const CrearEventoPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/event", { name, description });
      alert("Evento creado");
    } catch (err) {
      alert("Error al crear evento");
    }
  };

  return (
    <div>
      <h1>Crear Evento</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br/>
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /><br/>
        <button type="submit">Crear</button>
      </form>
    </div>
  );
};

export default CrearEventoPage;
