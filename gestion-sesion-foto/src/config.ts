// Configuración de la aplicación - v4.0 CON SUPABASE
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://gestion-sesion-de-foto.onrender.com" // Backend desplegado en Render - FORZADO
    : "http://localhost:4000");

// FALLBACK: Si Vercel no toma la variable, forzamos la URL correcta
const FINAL_API_URL = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL === "https://tu-backend-url.com"
  ? "https://gestion-sesion-de-foto.onrender.com"
  : API_BASE_URL;

// Configuración de Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pgdkcmrpvqxtxihtsewl.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZGtjbXJwdnF4dHhpaHRzZXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTE2MjQsImV4cCI6MjA3MDEyNzYyNH0.PsIx3i9hRG4jy5oJgfiNxu4WHz22iBivO_y6oIr_BXE";

// Debug: verificar qué URL se está usando
console.log("🔧 Configuración API v4 - CON SUPABASE:");
console.log("- VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("- VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("- PROD:", import.meta.env.PROD);
console.log("- Mode:", import.meta.env.MODE);
console.log("- API_BASE_URL inicial:", API_BASE_URL);
console.log("- FINAL_API_URL (corregida):", FINAL_API_URL);
console.log("- SUPABASE_URL:", SUPABASE_URL);
console.log("- Build timestamp:", new Date().toISOString());

// Exportar la URL corregida
export { FINAL_API_URL as API_BASE_URL_CORRECTED };
