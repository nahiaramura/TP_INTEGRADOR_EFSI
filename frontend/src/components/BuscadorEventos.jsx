import { useState, useEffect } from "react";
import api from "../api/axios";

const BuscadorEventos = ({ onFiltrar }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get("/tags");
        setAllTags(res.data);
      } catch (err) {
        console.error("Error al obtener tags:", err);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFiltrar({ name, startDate, tags });
  };

  const toggleTag = (tagId) => {
    setTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form className="card form">
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
        <input type="text" placeholder="Buscar por nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="text-muted">Etiquetas</div>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))"}}>
        {allTags.map((tag) => (
          <label key={tag.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input type="checkbox" value={tag.id} checked={tags.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
            {tag.name}
          </label>
        ))}
      </div>

      <div className="card-actions" style={{ justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-outline" onClick={() => { setName(""); setStartDate(""); setTags([]); onFiltrar({}); }}>Limpiar</button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Buscar</button>
      </div>
    </form>
  );
};

export default BuscadorEventos;
