import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
  import Login from "./pages/Login";
  import Employees from "./pages/employees/Employees";
  import Menu from "./pages/menu/Menu";

function App() {
    // El default redirect será /menu cuando estemos logueados, por ahora dejamos /login
  const defaultRedirect = "/login";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
