import EventoCard from "../components/EventoCard";

const EventosListPage = () => {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    api.get("/event?limit=10&offset=0")
      .then((res) => setEventos(res.data.collection))
      .catch(() => alert("Error al cargar eventos"));
  }, []);

  return (
    <div>
      <h1>Eventos</h1>
      {eventos.map(e => (
        <EventoCard key={e.id} evento={e} />
      ))}
    </div>
  );
};

export default EventosListPage;
