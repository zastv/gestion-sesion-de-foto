function getUser() {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export default function ProfileArea() {
  const user = getUser();

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="profile-area card" style={{ margin: "1rem 0", padding: "1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
      <div style={{ fontWeight: 600, fontSize: 18 }}>{user.name || user.email}</div>
      <div style={{ color: "var(--gray-500)", fontSize: 14 }}>{user.email}</div>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
