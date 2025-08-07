import { useState, useEffect } from "react";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";
import "./MyBookings.css";

interface Session {
  id: number;
  title: string;
  description: string;
  date: string;
  duration_minutes: number;
  location: string;
  status: string;
  created_at: string;
}

export default function MyBookings() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/my-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pendiente': return 'status-pending';
      case 'confirmada': return 'status-confirmed';
      case 'completada': return 'status-completed';
      case 'cancelada': return 'status-cancelled';
      case 'personalizado': return 'status-custom';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'personalizado': return 'Solicitud Personalizada';
      default: return status;
    }
  };

  const canCancel = (session: Session) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilSession > 24 && (session.status === 'pendiente' || session.status === 'confirmada');
  };

  const handleCancel = async (sessionId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta sesión?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Sesión cancelada exitosamente');
        fetchSessions(); // Recargar las sesiones
      } else {
        const error = await response.json();
        alert('Error al cancelar sesión: ' + error.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="my-bookings-container">
        <div className="loading-spinner">Cargando sesiones...</div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <h2>Mis Sesiones Agendadas</h2>
      
      {sessions.length === 0 ? (
        <div className="no-sessions">
          <p>No tienes sesiones agendadas</p>
          <p>¡Agenda tu primera sesión fotográfica!</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <h3>{session.title}</h3>
                <span className={`session-status ${getStatusClass(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
              </div>
              
              <div className="session-details">
                <div className="session-detail">
                  <strong>Fecha:</strong>
                  <span>{formatDate(session.date)}</span>
                </div>
                
                <div className="session-detail">
                  <strong>Duración:</strong>
                  <span>{session.duration_minutes} minutos</span>
                </div>
                
                <div className="session-detail">
                  <strong>Ubicación:</strong>
                  <span>{session.location}</span>
                </div>
                
                {session.description && (
                  <div className="session-detail">
                    <strong>Descripción:</strong>
                    <span>{session.description}</span>
                  </div>
                )}
                
                <div className="session-detail">
                  <strong>Solicitada:</strong>
                  <span>{new Date(session.created_at).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
              
              {canCancel(session) && (
                <div className="session-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => handleCancel(session.id)}
                  >
                    Cancelar Sesión
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
