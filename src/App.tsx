import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route></Route>
        <Route path="*" element={<Navigate to="/login" />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
