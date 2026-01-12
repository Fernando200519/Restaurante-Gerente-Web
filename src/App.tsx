import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth, AuthProvider } from "./context/AuthContext";
import SetupPasswordPage from "./pages/SetupPasswordPage";
import MesasPage from "./pages/MesasPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import Layout from "./components/Layout";
import { MesasProvider } from "./context/MesasContext";
import Employees from "./pages/EmployeesPage";
import Menu from "./pages/MenuPage";
import Ventas from "./pages/VentasPage";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const isInactive = isAuthenticated && user?.estado === "Inactivo";

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/mesas" replace /> : <LoginPage />
        }
      />

      <Route
        path="/setup-password"
        element={
          isAuthenticated ? <SetupPasswordPage /> : <Navigate to="/login" />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/mesas"
          element={
            isInactive ? (
              <Navigate to="/setup-password" replace />
            ) : (
              <Layout>
                <MesasProvider>
                  <MesasPage />
                </MesasProvider>
              </Layout>
            )
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

        <Route
          path="/employees"
          element={
            <Layout>
              <Employees />
            </Layout>
          }
        />

        <Route
          path="/menu"
          element={
            <Layout>
              <Menu />
            </Layout>
          }
        />

        <Route
          path="/ventas"
          element={
            <Layout>
              <Ventas />
            </Layout>
          }
        />
      </Route>

      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/mesas" : "/login"} replace />
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton expand={false} />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
