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

export default function PackageAdmin() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    duration_minutes: 60,
    photo_count: 10,
    location_count: 1,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`);
      if (!res.ok) throw new Error('Error al cargar paquetes');
      const data = await res.json();
      setPackages(data);
    } catch (err: any) {
      setError('Error al cargar paquetes: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión");
      setLoading(false);
      return;
    }

    try {
      const url = isEditing 
        ? `${API_BASE_URL}/api/packages/${isEditing}`
        : `${API_BASE_URL}/api/packages`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error en la operación');
      }

      setSuccess(isEditing ? 'Paquete actualizado exitosamente' : 'Paquete creado exitosamente');
      setFormData({
        name: "",
        price: "",
        description: "",
        duration_minutes: 60,
        photo_count: 10,
        location_count: 1,
        is_active: true
      });
      setIsEditing(null);
      setShowCreateForm(false);
      fetchPackages();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      name: pkg.name,
      price: pkg.price,
      description: pkg.description,
      duration_minutes: pkg.duration_minutes,
      photo_count: pkg.photo_count,
      location_count: pkg.location_count,
      is_active: pkg.is_active
    });
    setIsEditing(pkg.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este paquete?')) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }

      setSuccess('Paquete eliminado exitosamente');
      fetchPackages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      duration_minutes: 60,
      photo_count: 10,
      location_count: 1,
      is_active: true
    });
    setIsEditing(null);
    setShowCreateForm(false);
  };

  return (
    <div className="packages-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="packages-title">Administración de Paquetes</h2>
        <button 
          className="package-select" 
          onClick={() => setShowCreateForm(true)}
          style={{ backgroundColor: '#16a34a' }}
        >
          + Nuevo Paquete
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', textAlign: 'center', margin: '20px 0', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
      {success && <div style={{ color: '#16a34a', textAlign: 'center', margin: '20px 0', padding: '10px', backgroundColor: '#dcfce7', borderRadius: '6px' }}>{success}</div>}

      {(showCreateForm || isEditing) && (
        <form onSubmit={handleSubmit} style={{ 
          marginBottom: '30px', 
          background: '#f9fafb', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <h3>{isEditing ? 'Editar Paquete' : 'Crear Nuevo Paquete'}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <input
              className="form-input"
              type="text"
              placeholder="Nombre del paquete"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              className="form-input"
              type="text"
              placeholder="Precio (ej: $50)"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
          </div>

          <textarea
            className="form-input"
            placeholder="Descripción del paquete"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows={3}
            style={{ marginBottom: '16px', resize: 'vertical' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <input
              className="form-input"
              type="number"
              placeholder="Duración (minutos)"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
              required
            />
            <input
              className="form-input"
              type="number"
              placeholder="Número de fotos"
              value={formData.photo_count}
              onChange={(e) => setFormData({...formData, photo_count: parseInt(e.target.value) || 0})}
              required
            />
            <input
              className="form-input"
              type="number"
              placeholder="Número de locaciones"
              value={formData.location_count}
              onChange={(e) => setFormData({...formData, location_count: parseInt(e.target.value) || 0})}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              Paquete activo (visible para clientes)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="form-button" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Paquete')}
            </button>
            <button 
              type="button" 
              onClick={resetForm}
              style={{ 
                backgroundColor: '#6b7280', 
                color: 'white', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="packages-list">
        {packages.map((pkg) => (
          <div 
            className="package-card" 
            key={pkg.id}
            style={{ 
              opacity: pkg.is_active ? 1 : 0.6,
              border: pkg.is_active ? '2px solid #e5e7eb' : '2px dashed #d1d5db'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3>{pkg.name}</h3>
              <span style={{ 
                fontSize: '12px', 
                padding: '4px 8px', 
                borderRadius: '12px',
                backgroundColor: pkg.is_active ? '#dcfce7' : '#fee2e2',
                color: pkg.is_active ? '#16a34a' : '#dc2626'
              }}>
                {pkg.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="package-price">{pkg.price}</div>
            <div className="package-desc">{pkg.description}</div>
            <div style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0' }}>
              {pkg.duration_minutes} min • {pkg.photo_count} fotos • {pkg.location_count} locación(es)
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => handleEdit(pkg)}
                style={{ 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(pkg.id)}
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
