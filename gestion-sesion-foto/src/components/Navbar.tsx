import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: "/dashboard", label: "Sesiones", icon: "📅" },
    { path: "/gallery", label: "Galería", icon: "🖼️" },
    { path: "/packages", label: "Paquetes", icon: "📦" },
    { path: "/admin/packages", label: "Admin", icon: "⚙️" },
  ];
  
  const authItems = [
    { path: "/login", label: "Iniciar sesión", icon: "🔐" },
    { path: "/register", label: "Registrarse", icon: "👤" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <Link to="/dashboard" className="brand-link">
            <div className="brand-icon">📸</div>
            <span className="brand-text">LunaStudios</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {authItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`auth-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="auth-icon">{item.icon}</span>
              <span className="auth-text">{item.label}</span>
            </Link>
          ))}
          <Link to="/change-password" className="btn btn-secondary btn-sm">
            Cambiar contraseña
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="mobile-auth-links">
          {authItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`mobile-auth-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="auth-icon">{item.icon}</span>
              <span className="auth-text">{item.label}</span>
            </Link>
          ))}
          <Link 
            to="/change-password" 
            className="mobile-auth-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🔑 Cambiar contraseña
          </Link>
        </div>
      </div>
    </nav>
  );
}