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
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
      <Route element={<ProtectedRoute />}>
        <Route path="/mesas" element={<MesasPage />} />
        {/* Aquí puedes agregar más rutas protegidas, ej: /cocina, /pedidos */}
      </Route>

      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/mesas" : "/login"} replace />
        }
      />
    </Routes>
  );
}

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
