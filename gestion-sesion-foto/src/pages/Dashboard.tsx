import { useState } from "react";
import Navbar from "../components/Navbar";
import SessionManager from "../components/SessionManager";
import CalendarView from "../components/CalendarView";
import NewSessionForm from "../components/NewSessionForm";
import MyBookings from "../components/MyBookings";
import PaymentHistory from "../components/PaymentHistory";
import '../App.css';

import imgProfesional from '../assets/30135.jpg';
import imgClientes from '../assets/31450.jpg';
import imgCalidad from '../assets/IMG_8213.jpg';

export default function Dashboard() {
  const [reloadFlag, setReloadFlag] = useState(0);
  const [activeTab, setActiveTab] = useState("calendar");
  
  const handleSessionCreated = () => {
    setReloadFlag(f => f + 1);
  };

  const tabs = [
    { id: "calendar", label: "📅 Calendario", icon: "📅" },
    { id: "new-session", label: "➕ Nueva Sesión", icon: "➕" },
    { id: "my-bookings", label: "📋 Mis Reservas", icon: "📋" },
    { id: "sessions", label: "🎯 Gestión", icon: "🎯" },
    { id: "payments", label: "💳 Pagos", icon: "💳" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarView key={reloadFlag} />;
      case "new-session":
        return <NewSessionForm onSessionCreated={handleSessionCreated} />;
      case "my-bookings":
        return <MyBookings key={reloadFlag} />;
      case "sessions":
        return <SessionManager key={reloadFlag} />;
      case "payments":
        return <PaymentHistory />;
      default:
        return <CalendarView key={reloadFlag} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      
      {/* Hero Section */}
      <div className="container">
        <section className="hero-section animate-fadeIn">
          <div className="hero-content">
            <h1 className="hero-title">
              Captura tus momentos<br />
              <span style={{ 
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                más preciados
              </span>
            </h1>
            <p className="hero-description">
              Nuestro sistema de gestión de sesiones de fotografía te brinda una experiencia 
              de servicio eficiente y personalizada para crear recuerdos inolvidables.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => setActiveTab("new-session")}
              >
                ✨ Crear Nueva Sesión
              </button>
              <button 
                className="btn btn-secondary btn-lg"
                onClick={() => setActiveTab("calendar")}
              >
                📅 Ver Calendario
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="feature-grid animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="feature-card">
            <img src={imgProfesional} alt="Fotografía profesional" className="feature-image" />
            <div className="feature-content">
              <h3 className="feature-title">Fotografía Profesional</h3>
              <p className="feature-description">
                Captura tus momentos más valiosos con la más alta calidad y profesionalismo.
              </p>
              <div className="feature-badge">
                <span>⭐ Premium Quality</span>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <img src={imgClientes} alt="Clientes satisfechos" className="feature-image" />
            <div className="feature-content">
              <h3 className="feature-title">Clientes Satisfechos</h3>
              <p className="feature-description">
                Miles de clientes confían en nosotros para sus momentos especiales.
              </p>
              <div className="feature-badge">
                <span>❤️ 98% Satisfacción</span>
              </div>
            </div>
          </div>

          <div className="feature-card">
            <img src={imgCalidad} alt="Calidad garantizada" className="feature-image" />
            <div className="feature-content">
              <h3 className="feature-title">Calidad Garantizada</h3>
              <p className="feature-description">
                Equipos de última generación y técnicas avanzadas para resultados excepcionales.
              </p>
              <div className="feature-badge">
                <span>🏆 Calidad Premium</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-text">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content animate-fadeIn" key={activeTab}>
            {renderTabContent()}
          </div>
        </section>
      </div>
    </div>
  );
}
