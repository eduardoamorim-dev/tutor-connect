import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import Agendamento from './components/Agendamento';
import Avaliacao from './components/Avaliacao';
import "./index.css";

// Componente wrapper para verificar se precisa de onboarding
function ProtectedRoute({ token, children }) {
  const [needsOnboarding, setNeedsOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5001/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Verifica se o usuário tem pelo menos disciplinas_dominadas OU disciplinas_precisa
        const hasProfile = 
          (res.data.disciplinas_dominadas && res.data.disciplinas_dominadas.length > 0) ||
          (res.data.disciplinas_precisa && res.data.disciplinas_precisa.length > 0);
        
        setNeedsOnboarding(!hasProfile);
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
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

  // Se precisa de onboarding, redireciona
  if (needsOnboarding) {
    navigate('/setup-profile');
    return null;
  }

  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há token na URL (callback do Google)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      // Limpa a URL e redireciona para setup
      window.history.replaceState({}, document.title, '/setup-profile');
    }
    
    // Verifica validade do token
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await axios.get('http://localhost:5001/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.data.valid) {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    
    verifyToken();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-violet-700" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {token && window.location.pathname !== '/setup-profile' && window.location.pathname !== '/login' && (
          <nav className="bg-white shadow-md p-4 mb-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TC</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Tutor Connect</h1>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </nav>
        )}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />
            } 
          />
          
          {/* Rota de Setup/Onboarding */}
          <Route 
            path="/setup-profile" 
            element={
              token ? (
                <ProfileSetup 
                  token={token} 
                  onComplete={() => window.location.href = '/dashboard'}
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
                  <Dashboard token={token} />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/agendamento" 
            element={
              token ? (
                <ProtectedRoute token={token}>
                  <Agendamento token={token} />
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/avaliacao/:sessaoId" 
            element={
              token ? (
                <ProtectedRoute token={token}>
                  <Avaliacao token={token} />
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