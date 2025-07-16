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
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Buscar por nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <div>
        {allTags.map((tag) => (
          <label key={tag.id} style={{ marginRight: "10px" }}>
            <input
              type="checkbox"
              value={tag.id}
              checked={tags.includes(tag.id)}
              onChange={() => toggleTag(tag.id)}
            />
            {tag.name}
          </label>
        ))}
      </div>
      <button type="submit">Buscar</button>
    </form>
  );
};

export default BuscadorEventos;
