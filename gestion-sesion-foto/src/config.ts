// Configuración de la aplicación
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://gestion-sesion-de-foto.onrender.com" // Backend desplegado en Render
    : "http://localhost:4000");

// Debug: verificar qué URL se está usando
console.log("🔧 Configuración API:");
console.log("- VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("- PROD:", import.meta.env.PROD);
console.log("- API_BASE_URL final:", API_BASE_URL);
