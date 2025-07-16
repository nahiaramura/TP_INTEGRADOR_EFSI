import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import EventosListPage from "../pages/EventosListPage";
import EventoDetallePage from "../pages/EventoDetallePage";
import MisEventosPage from "../pages/MisEventosPage";
import CrearEventoPage from "../pages/CrearEventoPage";
import UbicacionesListPage from "../pages/UbicacionesListPage";
import ProtectedRoute from "../components/ProtectedRoute";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<EventosListPage />} />
        <Route path="/eventos" element={<EventosListPage />} />
        <Route path="/eventos/:id" element={<EventoDetallePage />} />
        <Route
          path="/mis-eventos"
          element={
            <ProtectedRoute>
              <MisEventosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-evento"
          element={
            <ProtectedRoute>
              <CrearEventoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ubicaciones"
          element={
            <ProtectedRoute>
              <UbicacionesListPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
