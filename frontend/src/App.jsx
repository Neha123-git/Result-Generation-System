import Admindash from "./pages/Admindash";
import Login from "./pages/Login";
import Home from "./Home";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

// Main App with Routing
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<Admindash />} />
      </Routes>
    </Router>
  );
}