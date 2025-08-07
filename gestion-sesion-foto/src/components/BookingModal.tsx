import { useState, useEffect } from "react";
import { API_BASE_URL_CORRECTED as API_BASE_URL } from "../config";
import "./BookingModal.css";

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  max_photos: number;
  locations_included: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedHour: string;
  onBookingSuccess: () => void;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedHour, 
  onBookingSuccess 
}: BookingModalProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Campos para solicitud personalizada
  const [customType, setCustomType] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customPhotos, setCustomPhotos] = useState("");
  const [customLocations, setCustomLocations] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setTitle(`Sesión ${pkg.name}`);
    setDescription(pkg.description);
    setShowCustomForm(false);
  };

  const handleCustomPackage = () => {
    setShowCustomForm(true);
    setSelectedPackage(null);
    setTitle("Solicitud Personalizada");
    setDescription("Paquete personalizado según necesidades específicas");
  };

  const formatDateTime = (date: string, hour: string) => {
    const [year, month, day] = date.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const [hours, minutes] = hour.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes));
    return dateObj.toISOString();
  };

  const handleBooking = async () => {
    if (!selectedPackage && !showCustomForm) {
      alert('Por favor selecciona un paquete');
      return;
    }

    if (!title || !location) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert('Debes iniciar sesión para agendar una sesión');
        return;
      }

      if (showCustomForm) {
        // Enviar solicitud personalizada
        if (!customType || !customTime || !customPhotos || !customLocations) {
          alert('Por favor completa todos los campos de la solicitud personalizada');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/custom-package`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            tipo: customType,
            tiempo: customTime,
            fotos: customPhotos,
            locaciones: customLocations
          })
        });

        if (response.ok) {
          alert('Solicitud personalizada enviada. Te contactaremos pronto para confirmar los detalles.');
          onBookingSuccess();
          onClose();
        } else {
          const error = await response.json();
          alert('Error al enviar solicitud: ' + error.error);
        }
      } else {
        // Agendar sesión regular
        const sessionDateTime = formatDateTime(selectedDate, selectedHour);
        
        const response = await fetch(`${API_BASE_URL}/api/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            date: sessionDateTime,
            duration_minutes: selectedPackage?.duration_minutes || 120,
            location,
            packageType: selectedPackage?.name || 'Personalizado'
          })
        });

        if (response.ok) {
          alert('¡Sesión agendada exitosamente!');
          onBookingSuccess();
          onClose();
        } else {
          const error = await response.json();
          alert('Error al agendar sesión: ' + error.error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPackage(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setShowCustomForm(false);
    setCustomType("");
    setCustomTime("");
    setCustomPhotos("");
    setCustomLocations("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="booking-modal-header">
          <h3>Agendar Sesión Fotográfica</h3>
          <button className="booking-modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="booking-modal-content">
          <div className="booking-date-info">
            <p><strong>Fecha:</strong> {selectedDate}</p>
            <p><strong>Hora:</strong> {selectedHour}</p>
          </div>

          {!showCustomForm ? (
            <>
              <div className="packages-section">
                <h4>Selecciona un Paquete</h4>
                <div className="packages-grid">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <h5>{pkg.name}</h5>
                      <p className="package-price">${pkg.price.toLocaleString()}</p>
                      <p className="package-duration">{pkg.duration_minutes} minutos</p>
                      <p className="package-details">{pkg.max_photos} fotos • {pkg.locations_included} locación(es)</p>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="custom-package-btn"
                  onClick={handleCustomPackage}
                >
                  Solicitar Paquete Personalizado
                </button>
              </div>

              {selectedPackage && (
                <div className="booking-form">
                  <h4>Detalles de la Sesión</h4>
                  <div className="form-group">
                    <label>Título de la sesión *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Sesión familiar en el parque"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalles adicionales sobre la sesión..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ubicación *</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej: Parque Central, Zona 1"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="custom-form">
              <h4>Solicitud de Paquete Personalizado</h4>
              <div className="form-group">
                <label>Tipo de sesión *</label>
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Ej: Boda, XV años, Corporativo..."
                />
              </div>
              
              <div className="form-group">
                <label>Duración aproximada (minutos) *</label>
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="Ej: 180"
                />
              </div>
              
              <div className="form-group">
                <label>Cantidad de fotos esperadas *</label>
                <input
                  type="text"
                  value={customPhotos}
                  onChange={(e) => setCustomPhotos(e.target.value)}
                  placeholder="Ej: 100-150 fotos editadas"
                />
              </div>
              
              <div className="form-group">
                <label>Locaciones/Requisitos especiales *</label>
                <textarea
                  value={customLocations}
                  onChange={(e) => setCustomLocations(e.target.value)}
                  placeholder="Describe las locaciones, equipos especiales, o requisitos específicos..."
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Ubicación para contacto *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ciudad o zona para coordinación"
                />
              </div>
            </div>
          )}
        </div>

        <div className="booking-modal-footer">
          <button 
            className="btn-secondary" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          {(selectedPackage || showCustomForm) && (
            <button 
              className="btn-primary" 
              onClick={handleBooking}
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : showCustomForm ? 'Enviar Solicitud' : 'Confirmar Reserva'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
