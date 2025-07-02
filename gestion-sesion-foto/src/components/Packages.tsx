import "./Packages.css";

const packages = [
  {
    name: "Pesonal",
    price: "$50",
    description: "Sesión de 30 minutos, 10 fotos editadas, 1 locación."
  },
  {
    name: "Premium",
    price: "$45",
    description: "Sesión de 1 hora, 30 fotos editadas, 2 locaciones, 1 álbum digital."
  },
  {
    name: "Personalizado",
    price: "De 50$ en adelante",
    description: "Usted elige el tipo de sesión, el tiempo, el número de fotos y el número de locaciones."
  },
  {
    name: "Promoción Verano",
    price: "$78",
    description: "Sesion especial"
  }
];

export default function Packages() {
  return (
    <div className="packages-container">
      <h2 className="packages-title">Paquetes y Promociones</h2>
      <div className="packages-list">
        {packages.map((pkg) => (
          <div className="package-card" key={pkg.name}>
            <h3>{pkg.name}</h3>
            <div className="package-price">{pkg.price}</div>
            <div className="package-desc">{pkg.description}</div>
            <button className="package-select">Seleccionar</button>
          </div>
        ))}
      </div>
    </div>
  );
} 