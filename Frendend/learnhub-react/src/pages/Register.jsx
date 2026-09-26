import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    if (name === "" || email === "" || password === "" || confirmPassword === "") { alert("Please fill in all fields."); return; }
    if (password !== confirmPassword) { alert("Passwords do not match."); return; }
    const existingUser = localStorage.getItem("learnhubUser");
    if (existingUser) {
      const user = JSON.parse(existingUser);
      if (user.email === email) { alert("An account with this email already exists."); return; }
    }
    localStorage.setItem("learnhubUser", JSON.stringify({ name, email, password }));
    alert("Registration successful!"); setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); navigate("/login");
  };
  return (
    <section className="register_section"><div className="register_container"><h1>Create Account</h1><p>Join LearnHub and start your learning journey.</p>
      <form onSubmit={handleSubmit}><div className="form_group"><label>Full Name</label><input type="text" placeholder="Enter your full name" value={name} onChange={(event) => setName(event.target.value)} /></div>
        <div className="form_group"><label>Email Address</label><input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <div className="form_group"><label>Password</label><input type="password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
        <div className="form_group"><label>Confirm Password</label><input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
        <button type="submit" className="register_button">Create Account</button>
      </form><p className="login_text">Already have an account? <Link to="/login">Login here</Link></p>
    </div></section>
  );
}
