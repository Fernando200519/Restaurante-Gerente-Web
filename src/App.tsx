// src/App.tsx (snippet)
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MesasPage from "./pages/MesasPage";
import OrdenDetalle from "./pages/OrdenDetalle";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/mesas" element={<MesasPage />} />
        <Route path="/ordenes/:id" element={<OrdenDetalle />} />
        <Route path="/" element={<Navigate to="/mesas" />} />
      </Routes>
    </Router>
  );
}

export default App;
