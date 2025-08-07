// Configuración de la aplicación - v3.0 DEFINITIVA
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://gestion-sesion-de-foto.onrender.com" // Backend desplegado en Render - FORZADO
    : "http://localhost:4000");

// FALLBACK: Si Vercel no toma la variable, forzamos la URL correcta
const FINAL_API_URL = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL === "https://tu-backend-url.com"
  ? "https://gestion-sesion-de-foto.onrender.com"
  : API_BASE_URL;

// Debug: verificar qué URL se está usando
console.log("🔧 Configuración API v3 - DEFINITIVA:");
console.log("- VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("- PROD:", import.meta.env.PROD);
console.log("- Mode:", import.meta.env.MODE);
console.log("- API_BASE_URL inicial:", API_BASE_URL);
console.log("- FINAL_API_URL (corregida):", FINAL_API_URL);
console.log("- Build timestamp:", new Date().toISOString());

// Exportar la URL corregida
export { FINAL_API_URL as API_BASE_URL_CORRECTED };
