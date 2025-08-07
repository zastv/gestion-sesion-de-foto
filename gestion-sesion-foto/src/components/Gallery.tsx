import { useState, useEffect } from "react";
import "./Gallery.css";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";

import img1 from "../assets/IMG_8771.jpg";
import img2 from "../assets/IMG_8664.jpg";
import img3 from "../assets/IMG_8649.jpg";
import img4 from "../assets/IMG_8640.jpg";
import img5 from "../assets/IMG_8632.jpg";
import img6 from "../assets/IMG_8627.jpg";
import img7 from "../assets/IMG_8625.jpg";
import img8 from "../assets/31450.jpg";
import img9 from "../assets/30135.jpg";
import img10 from "../assets/IMG_8213.jpg";
import img11 from "../assets/IMG_7638.png";
import img12 from "../assets/IMG_7569.png";
import img13 from "../assets/IMG_7555.png";
import img14 from "../assets/IMG_7554.png";
import img15 from "../assets/IMG_7547.png";
import img16 from "../assets/IMG_7462.png";
import img17 from "../assets/IMG_7459.png";
import img18 from "../assets/IMG_7441.png";

const images = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9,
  img10, img11, img12, img13, img14, img15, img16, img17, img18
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    try {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (userData && token) {
        setUser(JSON.parse(userData));
        fetchUserSessions(token);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const fetchUserSessions = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const sessions = await response.json();
        setUserSessions(sessions);
      }
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="gallery-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p>Cargando galería...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="gallery-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Acceso Restringido</h2>
        <p>Debes iniciar sesión para ver la galería de fotos.</p>
        <a href="/login" className="btn btn-primary">Iniciar Sesión</a>
      </div>
    );
  }

  if (userSessions.length === 0) {
    return (
      <div className="gallery-container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Sin Sesiones</h2>
        <p>Aún no tienes sesiones de fotografía. ¡Reserva tu primera sesión!</p>
        <a href="/packages" className="btn btn-primary">Ver Paquetes</a>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Mi Galería de Fotos</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--gray-600)' }}>
        Fotos de tus {userSessions.length} sesión{userSessions.length !== 1 ? 'es' : ''} de fotografía
      </p>
      <div className="gallery-grid">
        {images.map((img, idx) => (
          <img
            src={img}
            alt={`Foto ${idx + 1}`}
            className="gallery-img"
            key={idx}
            onClick={() => setLightbox(img)}
          />
        ))}
      </div>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Vista ampliada" className="lightbox-img" />
        </div>
      )}
    </div>
  );
}