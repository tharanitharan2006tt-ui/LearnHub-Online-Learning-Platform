import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar_logo">
        <Link to="/">LearnHub</Link>
      </div>

      <div className="nav_links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>

        {isLoggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/my-learning">My Learning</Link>
            <Link to="/profile">Profile</Link>
            <button
              type="button"
              className="logout_button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
