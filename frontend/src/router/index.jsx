import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import EditarUbicacionPage from "../pages/EditarUbicacionPage"; // ✅
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import EventosListPage from "../pages/EventosListPage";
import EventoDetallePage from "../pages/EventoDetallePage";
import MisEventosPage from "../pages/MisEventosPage";
import CrearEventoPage from "../pages/CrearEventoPage";
import EditarEventoPage from "../pages/EditarEventoPage";
import UbicacionesListPage from "../pages/UbicacionesListPage";
import CrearUbicacionPage from "../pages/CrearUbicacionPage"; // ✅ NUEVO
import ProtectedRoute from "../components/ProtectedRoute";

const Router = () => {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1, padding: "1rem" }}>
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
              path="/editar-evento/:id"
              element={
                <ProtectedRoute>
                  <EditarEventoPage />
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
            <Route
              path="/crear-ubicacion"
              element={
                <ProtectedRoute>
                  <CrearUbicacionPage />
                </ProtectedRoute>
              }
            />
            <Route
  path="/editar-ubicacion/:id"
  element={
    <ProtectedRoute>
      <EditarUbicacionPage />
    </ProtectedRoute>
  }
/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default Router;
