// Configuración de la aplicación
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://gestion-sesion-de-foto.onrender.com" // Backend desplegado en Render
    : "http://localhost:4000");
