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
      <span className="brand-name">Primetrade.ai</span>

      {user && (
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
            Tasks
          </Link>
          {user.role === "ADMIN" && (
            <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
              Users
            </Link>
          )}
        </div>
      )}

      {user && (
        <div className="navbar-user">
          <span className="user-badge">{user.role}</span>
          <span className="user-name">{user.name}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
