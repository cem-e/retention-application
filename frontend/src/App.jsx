import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import AppRouter from "./router/AppRouter";
import flatpayLogo from "./assets/logo.png";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogoClick() {
    if (location.pathname === "/") {
      window.location.reload();
      return;
    }

    navigate("/");
  }

  return (
    <main className="dashboard">
      <Header logo={flatpayLogo} onLogoClick={handleLogoClick} />
      <AppRouter />
    </main>
  );
}
