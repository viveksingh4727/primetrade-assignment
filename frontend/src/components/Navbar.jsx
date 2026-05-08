import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">Primetrade.ai</span>
      </div>

      {user && (
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
            Dashboard
          </Link>
          {user.role === "ADMIN" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
              Admin
            </Link>
          )}
        </div>
      )}

      {user && (
        <div className="navbar-user">
          <span className="user-badge">{user.role}</span>
          <span className="user-name">{user.name}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
