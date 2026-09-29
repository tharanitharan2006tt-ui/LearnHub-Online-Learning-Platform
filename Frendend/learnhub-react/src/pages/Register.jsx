import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    setSuccessMessage("");
    setErrors({});

    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.registerUser({ full_name: name.trim(), email, password });
      setSuccessMessage("Registration successful! Redirecting to login...");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      const fieldErrors = error.fieldErrors || {};
      setErrors({
        ...(fieldErrors.full_name && { name: fieldErrors.full_name }),
        ...(fieldErrors.name && { name: fieldErrors.name }),
        ...(fieldErrors.email && { email: fieldErrors.email }),
        ...(fieldErrors.password && { password: fieldErrors.password }),
      });
      setApiError(
        error.message || "Unable to create your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="register_section">
      <div className="register_container">
        <h1>Create Account</h1>
        <p>Join LearnHub and start your learning journey.</p>

        {apiError && <p className="form_error_message" role="alert">{apiError}</p>}
        {successMessage && <p className="form_success_message">{successMessage}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form_group">
            <label htmlFor="register-name">Full Name</label>
            <input id="register-name" type="text" autoComplete="name" placeholder="Enter your full name" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "register-name-error" : undefined} />
            {errors.name && <span className="field_error" id="register-name-error">{errors.name}</span>}
          </div>
          <div className="form_group">
            <label htmlFor="register-email">Email Address</label>
            <input id="register-email" type="email" autoComplete="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "register-email-error" : undefined} />
            {errors.email && <span className="field_error" id="register-email-error">{errors.email}</span>}
          </div>
          <div className="form_group">
            <label htmlFor="register-password">Password</label>
            <input id="register-password" type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "register-password-error" : undefined} />
            {errors.password && <span className="field_error" id="register-password-error">{errors.password}</span>}
          </div>
          <div className="form_group">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <input id="register-confirm-password" type="password" autoComplete="new-password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "register-confirm-password-error" : undefined} />
            {errors.confirmPassword && <span className="field_error" id="register-confirm-password-error">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" className="register_button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="login_text">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </section>
  );
}
