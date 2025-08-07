// Configuración de la aplicación - v5.0 con Stripe
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://gestion-sesion-de-foto.onrender.com"
    : "http://localhost:4000");

const FINAL_API_URL = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL === "https://tu-backend-url.com"
  ? "https://gestion-sesion-de-foto.onrender.com"
  : API_BASE_URL;

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pgdkcmrpvqxtxihtsewl.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZGtjbXJwdnF4dHhpaHRzZXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTE2MjQsImV4cCI6MjA3MDEyNzYyNH0.PsIx3i9hRG4jy5oJgfiNxu4WHz22iBivO_y6oIr_BXE";

// Configuración de Stripe (cargada desde el backend)
export const STRIPE_CONFIG = {
  // La clave pública se obtiene del endpoint /api/stripe-config
  publishableKey: null as string | null
};

console.log("🔧 Configuración API v5 - Pagos con Stripe:");
console.log("- API_BASE_URL:", FINAL_API_URL);
console.log("- SUPABASE_URL:", SUPABASE_URL);
console.log("- Environment:", import.meta.env.MODE);

export { FINAL_API_URL as API_BASE_URL_CORRECTED };
