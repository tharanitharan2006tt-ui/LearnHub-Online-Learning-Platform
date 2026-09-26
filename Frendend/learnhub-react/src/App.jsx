import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
      <Footer />
    </AuthProvider>
  );
}
