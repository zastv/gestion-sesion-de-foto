// Configuración de la aplicación
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://tu-backend-en-produccion.com" // Cambiar cuando despliegues el backend
    : "http://localhost:4000");
