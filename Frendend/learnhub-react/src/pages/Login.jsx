import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    if (email === "" || password === "") { alert("Please fill in all fields."); return; }
    const savedUser = localStorage.getItem("learnhubUser");
    if (!savedUser) { alert("No account found. Please create an account first."); return; }
    const user = JSON.parse(savedUser);
    if (user.email !== email || user.password !== password) { alert("Invalid email or password."); return; }
    login(); alert(`Welcome back, ${user.name}!`); setEmail(""); setPassword(""); navigate("/dashboard");
  };
  return (
    <section className="login_section"><div className="login_container"><h1>Welcome Back</h1><p>Login to continue learning with LearnHub.</p>
      <form onSubmit={handleSubmit}><div className="form_group"><label>Email Address</label><input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <div className="form_group"><label>Password</label><input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <button type="submit" className="login_button">Login</button>
      </form><p className="register_text">Don't have an account? <Link to="/register">Create Account</Link></p>
    </div></section>
  );
}
