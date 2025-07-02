import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">LunaStudios</div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Sesiones</Link></li>
        <li><Link to="/gallery">Galería</Link></li>
        <li><Link to="/packages">Paquetes</Link></li>
        <li><Link to="/login">Cerrar sesión</Link></li>
      </ul>
    </nav>
  );
} 