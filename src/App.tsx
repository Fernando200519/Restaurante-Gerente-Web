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
import OrdersPage from "./pages/OrdersPage";
import Layout from "./components/Layout"; // 👈 1. Asegúrate de importar tu Layout
import { MesasProvider } from "./context/MesasContext";

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
        {/* 👈 2. Aquí envuelves cada página con <Layout> */}
        <Route
          path="/mesas"
          element={
            <Layout>
              <MesasProvider>
                <MesasPage />
              </MesasProvider>
            </Layout>
          }
        />

        <Route
          path="/ordenes"
          element={
            <Layout>
              <OrdersPage />
            </Layout>
          }
        />
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
