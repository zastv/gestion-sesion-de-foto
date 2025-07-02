import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GalleryPage from "./pages/Gallery";
import PackagesPage from "./pages/Packages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/packages" element={<PackagesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
