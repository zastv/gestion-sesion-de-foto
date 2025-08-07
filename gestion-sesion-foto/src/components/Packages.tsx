import { useState, useEffect } from "react";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";
import "./Packages.css";

interface Package {
  id: number;
  name: string;
  price: string;
  description: string;
  duration_minutes: number;
  photo_count: number;
  location_count: number;
  is_active: boolean;
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({ tipo: "", tiempo: "", fotos: "", locaciones: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Cargar paquetes desde la base de datos
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/packages`);
        if (!res.ok) throw new Error('Error al cargar paquetes');
        const data = await res.json();
        setPackages(data.filter((pkg: Package) => pkg.is_active));
      } catch (err: any) {
        setError('Error al cargar paquetes: ' + err.message);
      } finally {
        setLoadingPackages(false);
      }
    };
    
    fetchPackages();
  }, []);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión para solicitar un paquete personalizado.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/custom-package`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(custom)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar solicitud personalizada");
      setSuccess("¡Solicitud personalizada enviada y guardada!");
      setCustom({ tipo: "", tiempo: "", fotos: "", locaciones: "" });
      setTimeout(() => setSuccess(""), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="packages-container">
      <h2 className="packages-title">Paquetes y Promociones</h2>
      
      {loadingPackages ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando paquetes...</p>
        </div>
      ) : (
        <div className="packages-list">
          {packages.map((pkg) => (
            <div className="package-card" key={pkg.id}>
              <h3>{pkg.name}</h3>
              <div className="package-price">{pkg.price}</div>
              <div className="package-desc">{pkg.description}</div>
              <div className="package-details">
                <small>
                  {pkg.duration_minutes} min • {pkg.photo_count} fotos • {pkg.location_count} locación(es)
                </small>
              </div>
              {pkg.name === "Personalizado" ? (
                <button className="package-select" onClick={() => setShowCustom(v => !v)}>
                  Personalizar
                </button>
              ) : (
                <button className="package-select">Seleccionar</button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {error && <div style={{ color: '#dc2626', textAlign: 'center', margin: '20px 0' }}>{error}</div>}
      
      {showCustom && (
        <form className="custom-form" onSubmit={handleCustomSubmit} style={{ marginTop: 24, background: "#f9fafb", padding: 24, borderRadius: 12, boxShadow: "0 2px 8px #0001", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          <h4>Personaliza tu sesión</h4>
          <input className="form-input" placeholder="Tipo de sesión" value={custom.tipo} onChange={e => setCustom({ ...custom, tipo: e.target.value })} required />
          <input className="form-input" placeholder="Tiempo (minutos)" value={custom.tiempo} onChange={e => setCustom({ ...custom, tiempo: e.target.value })} required />
          <input className="form-input" placeholder="Número de fotos" value={custom.fotos} onChange={e => setCustom({ ...custom, fotos: e.target.value })} required />
          <input className="form-input" placeholder="Número de locaciones" value={custom.locaciones} onChange={e => setCustom({ ...custom, locaciones: e.target.value })} required />
          <button className="form-button" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar solicitud"}</button>
          {success && <div style={{ color: "#16a34a", marginTop: 12 }}>{success}</div>}
          {error && <div style={{ color: "#dc2626", marginTop: 12 }}>{error}</div>}
        </form>
      )}
    </div>
  );
}