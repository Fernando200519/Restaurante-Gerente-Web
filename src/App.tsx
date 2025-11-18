import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import MesasPage from "./pages/MesasPage";
import LoginPage from "./pages/Login";

const ProtectedRoute = () => {
  // Asumimos que tu hook useAuth devuelve al usuario o un 'token'
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Si no está autenticado, lo mandamos al login
    return <Navigate to="/login" replace />;
  }

  // Si sí está autenticado, le mostramos la página que quería ver
  return <Outlet />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/mesas" replace /> : <LoginPage />
        }
      />

      {/* --- Rutas Protegidas --- */}
      {/* Todo lo que esté aquí adentro requerirá autenticación */}
      <Route element={<ProtectedRoute />}>
        <Route path="/mesas" element={<MesasPage />} />
        {/* Aquí puedes agregar más rutas protegidas, ej: /cocina, /pedidos */}
      </Route>

      {/* Redirección principal */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/mesas" : "/login"} replace />
        }
      />
    </Routes>
  );
}

/**
 * Envolvemos las rutas con el AuthProvider y el Router
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
