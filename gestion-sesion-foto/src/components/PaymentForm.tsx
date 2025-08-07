import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";
import "./PaymentForm.css";

// Configuración de Stripe
let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe-config`);
      const { publishableKey } = await response.json();
      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error('Error loading Stripe config:', error);
      // Fallback a una clave de prueba
      stripePromise = loadStripe('pk_test_51...');
    }
  }
  return stripePromise;
};

interface PaymentFormProps {
  sessionId: number;
  amount: number;
  sessionTitle: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentFormComponent = ({ sessionId, amount, sessionTitle, onPaymentSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(amount);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    createPaymentIntent();
  }, [sessionId, amount]);

  const createPaymentIntent = async (appliedCoupon = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          amount,
          couponCode: appliedCoupon
        })
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setFinalAmount(data.finalAmount);
        setCouponDiscount(data.discountAmount || 0);
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Error de conexión');
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          couponCode: couponCode.trim().toUpperCase(),
          amount
        })
      });

      if (response.ok) {
        setCouponError("");
        setCouponApplied(true);
        await createPaymentIntent(couponCode.trim().toUpperCase());
      } else {
        const error = await response.json();
        setCouponError(error.error);
        setCouponApplied(false);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError("Error validating coupon");
    }
  };

  const removeCoupon = async () => {
    setCouponCode("");
    setCouponError("");
    setCouponApplied(false);
    setCouponDiscount(0);
    await createPaymentIntent("");
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Cliente Fotografía',
        },
      }
    });

    setIsLoading(false);

    if (error) {
      console.error('Payment error:', error);
      alert('Error en el pago: ' + error.message);
    } else if (paymentIntent.status === 'succeeded') {
      alert('¡Pago exitoso! Tu sesión ha sido confirmada.');
      onPaymentSuccess();
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h3>💳 Pagar Sesión Fotográfica</h3>
        <p className="session-title">{sessionTitle}</p>
      </div>

      <div className="payment-summary">
        <div className="amount-row">
          <span>Subtotal:</span>
          <span>${amount.toFixed(2)}</span>
        </div>
        
        {couponDiscount > 0 && (
          <div className="discount-row">
            <span>Descuento ({couponCode}):</span>
            <span className="discount-amount">-${couponDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="total-row">
          <strong>
            <span>Total:</span>
            <span>${finalAmount.toFixed(2)}</span>
          </strong>
        </div>
      </div>

      {!couponApplied && (
        <div className="coupon-section">
          <h4>🎟️ ¿Tienes un cupón?</h4>
          <div className="coupon-input-group">
            <input
              type="text"
              placeholder="Código de cupón"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className={couponError ? 'error' : ''}
            />
            <button 
              type="button" 
              onClick={validateCoupon}
              className="validate-coupon-btn"
            >
              Aplicar
            </button>
          </div>
          {couponError && <p className="error-message">{couponError}</p>}
        </div>
      )}

      {couponApplied && (
        <div className="coupon-applied">
          <span className="coupon-success">✅ Cupón {couponCode} aplicado</span>
          <button type="button" onClick={removeCoupon} className="remove-coupon-btn">
            Remover
          </button>
        </div>
      )}

      <form onSubmit={handlePayment} className="payment-form">
        <h4>💳 Información de Pago</h4>
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            disabled={!stripe || isLoading || !clientSecret}
            className="pay-btn"
          >
            {isLoading ? 'Procesando...' : `Pagar $${finalAmount.toFixed(2)}`}
          </button>
        </div>
      </form>

      <div className="payment-security">
        <p>🔒 Pago seguro procesado por Stripe</p>
        <p>Aceptamos Visa, Mastercard, American Express</p>
      </div>
    </div>
  );
};

const PaymentForm = (props: PaymentFormProps) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    getStripe().then(setStripePromise);
  }, []);

  if (!stripePromise) {
    return <div className="loading-stripe">Cargando sistema de pagos...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormComponent {...props} />
    </Elements>
  );
};

export default PaymentForm;
