import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
