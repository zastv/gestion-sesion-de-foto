import "./NewSessionForm.css";

export default function NewSessionForm() {
  return (
    <form className="new-session-form">
      <h3 className="form-title">Agendar Nueva Sesión</h3>
      <label>
        Fecha:
        <input type="date" className="form-input" required />
      </label>
      <label>
        Hora:
        <input type="time" className="form-input" required />
      </label>
      <label>
        Tipo de sesión:
        <input type="text" className="form-input" placeholder="Ej: Retrato, Familiar..." required />
      </label>
      <label>
        Paquete/Promoción:
        <select className="form-input">
          <option>Selecciona un paquete</option>
          <option>Básico</option>
          <option>Premium</option>
          <option>Promoción Verano</option>
        </select>
      </label>
      <label>
        Notas:
        <textarea className="form-input" placeholder="Notas adicionales"></textarea>
      </label>
      <button className="form-button" type="submit">Agendar Sesión</button>
    </form>
  );
} 