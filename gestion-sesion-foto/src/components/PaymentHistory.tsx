import { useState, useEffect } from "react";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";
import "./PaymentHistory.css";

interface Payment {
  id: number;
  session_id: number;
  session_title?: string;
  amount: number;
  final_amount: number;
  coupon_used?: string;
  status: string;
  stripe_payment_intent_id: string;
  created_at: string;
}

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay sesión activa");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al cargar el historial");
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="payment-history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando historial de pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-container">
        <div className="error-state">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={fetchPaymentHistory} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="payment-history-header">
        <h2>💳 Historial de Pagos</h2>
        <p>Aquí puedes ver todos tus pagos realizados</p>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No hay pagos registrados</h3>
          <p>Cuando realices tu primer pago aparecerá aquí</p>
        </div>
      ) : (
        <div className="payments-grid">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-card">
              <div className="payment-card-header">
                <div className="payment-status">
                  <span className="status-icon">
                    {getStatusIcon(payment.status)}
                  </span>
                  <span className={`status-text status-${payment.status}`}>
                    {getStatusText(payment.status)}
                  </span>
                </div>
                <div className="payment-date">
                  {formatDate(payment.created_at)}
                </div>
              </div>

              <div className="payment-card-body">
                <h4 className="session-title">
                  📸 {payment.session_title || `Sesión #${payment.session_id}`}
                </h4>
                
                <div className="payment-amounts">
                  {payment.amount !== payment.final_amount && (
                    <div className="original-amount">
                      <span>Precio original:</span>
                      <span>${payment.amount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {payment.coupon_used && (
                    <div className="coupon-info">
                      <span>🎟️ Cupón aplicado:</span>
                      <span className="coupon-code">{payment.coupon_used}</span>
                    </div>
                  )}
                  
                  <div className="final-amount">
                    <span>Total pagado:</span>
                    <span className="amount-value">${payment.final_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="payment-card-footer">
                <div className="payment-id">
                  ID: {payment.stripe_payment_intent_id.substring(0, 20)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="payment-summary">
        <div className="summary-card">
          <h3>📊 Resumen</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total de pagos:</span>
              <span className="stat-value">{payments.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pagos exitosos:</span>
              <span className="stat-value">
                {payments.filter(p => p.status === 'succeeded').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total gastado:</span>
              <span className="stat-value">
                ${payments
                  .filter(p => p.status === 'succeeded')
                  .reduce((total, p) => total + p.final_amount, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
