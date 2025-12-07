import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { Toaster } from "sonner";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProfileSetup from "./components/ProfileSetup";
import Profile from "./components/Profile";
import Notifications from "./components/Notifications";
import "./index.css";

const API_URL = "http://localhost:5001";

// Componente wrapper para verificar se precisa de onboarding
function ProtectedRoute({ token, children }) {
  const [needsOnboarding, setNeedsOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNeedsOnboarding(!res.data.profileCompleted);
      } catch (error) {
        console.error("Erro ao verificar perfil:", error);
        setNeedsOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkProfile();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-violet-700" />
      </div>
    );
  }

  if (needsOnboarding && location.pathname !== "/setup-profile") {
    return <Navigate to="/setup-profile" replace />;
  }

  return children;
}

// Componente de Navbar com Notificações
function Navbar({ user, token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Tutor Connect
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/profile")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/profile")
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Meu Perfil
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Componente de Notificações */}
            <Notifications token={token} />
            
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
              <p className="text-xs text-gray-500">
                {user?.isTutor ? "Tutor" : "Aluno"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há token na URL (callback do Google)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      setToken(urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Verifica validade do token
    const verifyToken = async () => {
      const currentToken = urlToken || token;
      if (currentToken) {
        try {
          const res = await axios.get(`${API_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          });
          if (res.data.valid) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-violet-700" />
      </div>
    );
  }

  const showNavbar = token && user?.profileCompleted;

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50">
        {showNavbar && <Navbar user={user} token={token} onLogout={handleLogout} />}

        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login setToken={setToken} />
              )
            }
          />

          <Route
            path="/setup-profile"
            element={
              token ? (
                <ProfileSetup
                  token={token}
                  onComplete={() => {
                    refreshUser();
                    window.location.href = "/dashboard";
                  }}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              token ? (
                <ProtectedRoute token={token}>
                  <Dashboard token={token} user={user} />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/profile"
            element={
              token ? (
                <ProtectedRoute token={token}>
                  <Profile token={token} user={user} onUpdate={refreshUser} />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/"
            element={<Navigate to={token ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
