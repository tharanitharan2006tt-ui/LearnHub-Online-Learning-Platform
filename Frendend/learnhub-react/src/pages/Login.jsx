import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");
    setErrors({});

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    if (!password) nextErrors.password = "Password is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.loginUser({ email, password });
      const user = response?.user || null;
      const token = response?.access || response?.token;

      if (!token) {
        throw new Error("Authentication token missing.");
      }

      login(token, user);
      navigate("/dashboard");
    } catch (error) {
      const fieldErrors = error.fieldErrors || {};
      if (fieldErrors.email || fieldErrors.password) {
        setErrors({
          ...(fieldErrors.email && { email: fieldErrors.email }),
          ...(fieldErrors.password && { password: fieldErrors.password }),
        });
      }
      setApiError(
        error.status === 400 && Object.keys(fieldErrors).length === 0
          ? "Invalid email or password."
          : error.message || "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login_section">
      <div className="login_container">
        <div className="login_welcome">
          <span className="login_eyebrow">LEARNHUB • LEARN WITHOUT LIMITS</span>
          <h1>Welcome back.</h1>
          <p>Pick up where you left off and keep moving toward your goals.</p>
          <div className="login_highlight">
            <span aria-hidden="true">✦</span>
            <p>One lesson at a time, build skills that open new possibilities.</p>
          </div>
        </div>

        <div className="login_form_panel">
          <h2>Sign in</h2>
          <p className="login_form_intro">Enter your account details to continue.</p>
          {apiError && <p className="form_error_message" role="alert">{apiError}</p>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form_group">
              <label htmlFor="login-email">Email Address</label>
              <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} />
              {errors.email && <span className="field_error" id="login-email-error">{errors.email}</span>}
            </div>

            <div className="form_group">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} />
              {errors.password && <span className="field_error" id="login-password-error">{errors.password}</span>}
            </div>

            <button type="submit" className="login_button" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="register_text">New to LearnHub? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </section>
  );
}
