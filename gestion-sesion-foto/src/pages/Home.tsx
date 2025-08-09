import { useState } from 'react';
import Navbar from '../components/Navbar';
import CalendarView from '../components/CalendarView';
import Gallery from '../components/Gallery';
import Packages from '../components/Packages';
import '../App.css';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>('');

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Sesiones de Fotografía Profesional</h1>
            <p>Captura tus momentos más especiales con nuestra experiencia profesional</p>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="calendar-section">
          <div className="section-container">
            <h2>Disponibilidad de Horarios</h2>
            <p>Consulta los días y horarios disponibles para tu sesión</p>
            <CalendarView 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </section>

        {/* Packages Section */}
        <section className="packages-section">
          <div className="section-container">
            <Packages />
          </div>
        </section>

        {/* Gallery Section */}
        <section className="gallery-section">
          <div className="section-container">
            <h2>Galería de Trabajos</h2>
            <Gallery />
          </div>
        </section>
      </main>
    </div>
  );
}
