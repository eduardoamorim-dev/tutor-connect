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
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import "./index.css";

const API_URL = "http://localhost:5001";

// Componente wrapper para verificar se precisa de onboarding
function ProtectedRoute({ token, children }) {
  const [needsOnboarding, setNeedsOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-violet-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full animate-[loading_1s_ease-in-out_infinite]"
              style={{
                width: "50%",
                animation: "loading 1s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (needsOnboarding && location.pathname !== "/setup-profile") {
    return <Navigate to="/setup-profile" replace />;
  }

  return children;
}

// Componente de Navbar Profissional
function Navbar({ user, token, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para adicionar sombra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/profile", label: "Meu Perfil", icon: User },
  ];

  return (
    <>
      <nav
        className={`bg-white/80 backdrop-blur-lg border-b sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "shadow-md border-transparent" : "border-gray-100"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-violet-300 transition-all duration-300 group-hover:scale-105">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
                  Tutor Connect
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notificações */}
              <Notifications token={token} />

              {/* User Menu - Desktop */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.nome?.split(" ")[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.isTutor ? "Tutor" : "Aluno"}
                  </p>
                </div>
                <Avatar className="h-9 w-9 ring-2 ring-violet-100">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-medium">
                    {getInitials(user?.nome)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 border-t" : "max-h-0"
          }`}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-violet-200">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium">
                  {getInitials(user?.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{user?.nome}</p>
                <p className="text-sm text-violet-600">
                  {user?.isTutor ? "Tutor" : "Aluno"}
                </p>
              </div>
            </div>

            {/* Nav Items Mobile */}
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}

            {/* Logout Mobile */}
            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-red-600 hover:bg-red-50 transition-all duration-200 mt-4 border-t pt-4"
            >
              <LogOut className="w-5 h-5" />
              Sair da conta
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-violet-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-200 animate-bounce">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const showNavbar = token && user?.profileCompleted;

  return (
    <Router>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
        {showNavbar && (
          <Navbar user={user} token={token} onLogout={handleLogout} />
        )}

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
