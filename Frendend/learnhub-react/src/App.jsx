import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();
  const isQuizPage = /^\/quiz(?:\/|$)/.test(pathname);

  useEffect(() => {
    const handleAuthError = (event) => {
      const message = event.detail || "Your session has expired. Please log in again.";
      window.alert(message);
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:error", handleAuthError);
    return () => window.removeEventListener("auth:error", handleAuthError);
  }, [navigate]);

  return (
    <>
      <Navbar />
      <main className="app_main">
        <AppRoutes />
      </main>
      <Footer />
      {isLoggedIn && !isQuizPage && <Chatbot />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
