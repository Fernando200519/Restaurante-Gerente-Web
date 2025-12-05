// src/App.tsx
import React from "react";
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
import Layout from "./components/Layout";
import { MesasProvider } from "./context/MesasContext";
import Employees from "./pages/Employees";
import Menu from "./pages/Menu";
import Ventas from "./pages/Ventas";

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

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
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

        {/* Employees */}
        <Route
          path="/employees"
          element={
            <Layout>
              <Employees />
            </Layout>
          }
        />

        {/* Menú */}
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
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
