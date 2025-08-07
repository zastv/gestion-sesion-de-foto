import { useState, useEffect } from "react";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";
import PaymentForm from "./PaymentForm";
import "./SessionManager.css";

interface Session {
  id: number;
  title: string;
  date: string;
  time: string;
  package_id: number;
  package_name?: string;
  package_price?: number;
  status: string;
  paid: boolean;
  created_at: string;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const fetchUserSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Error fetching sessions');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handlePaymentClick = (session: Session) => {
    setSelectedSession(session);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedSession(null);
    fetchUserSessions(); // Refresh sessions
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="session-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando tus sesiones...</p>
        </div>
      </div>
    );
  }

  if (showPaymentForm && selectedSession) {
    return (
      <div className="session-container">
        <PaymentForm
          sessionId={selectedSession.id}
          amount={selectedSession.package_price || 0}
          sessionTitle={selectedSession.title}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentForm(false);
            setSelectedSession(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="session-container">
      <div className="session-header">
        <h2 className="session-title">📸 Mis Sesiones Fotográficas</h2>
        <p className="session-subtitle">Gestiona tus sesiones reservadas</p>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-sessions">
          <div className="empty-icon">📅</div>
          <h3>No tienes sesiones reservadas</h3>
          <p>Ve a "Paquetes" para reservar tu primera sesión</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-card-header">
                <h3 className="session-card-title">{session.title}</h3>
                <div 
                  className="session-status"
                  style={{ backgroundColor: getStatusColor(session.status) }}
                >
                  {getStatusText(session.status)}
                </div>
              </div>

              <div className="session-card-body">
                <div className="session-detail">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{formatDate(session.date)}</span>
                </div>

                <div className="session-detail">
                  <span className="detail-icon">🕐</span>
                  <span className="detail-text">{session.time}</span>
                </div>

                <div className="session-detail">
                  <span className="detail-icon">📦</span>
                  <span className="detail-text">{session.package_name || 'Paquete estándar'}</span>
                </div>

                {session.package_price && (
                  <div className="session-detail">
                    <span className="detail-icon">💰</span>
                    <span className="detail-text">${session.package_price.toFixed(2)}</span>
                  </div>
                )}

                <div className="session-detail">
                  <span className="detail-icon">💳</span>
                  <span className={`payment-status ${session.paid ? 'paid' : 'unpaid'}`}>
                    {session.paid ? '✅ Pagado' : '❌ Pendiente de pago'}
                  </span>
                </div>
              </div>

              <div className="session-card-footer">
                {!session.paid && session.status.toLowerCase() !== 'cancelled' && (
                  <button 
                    className="pay-session-btn"
                    onClick={() => handlePaymentClick(session)}
                  >
                    💳 Pagar Sesión
                  </button>
                )}

                {session.paid && (
                  <div className="session-paid-info">
                    <span className="paid-badge">✅ Sesión pagada</span>
                  </div>
                )}
              </div>

              <div className="session-created">
                Reservada el {new Date(session.created_at).toLocaleDateString('es-ES')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 