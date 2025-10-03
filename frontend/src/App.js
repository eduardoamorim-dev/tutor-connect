import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Agendamento from './components/Agendamento';
import Avaliacao from './components/Avaliacao';

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
      // Limpa a URL
      window.history.replaceState({}, document.title, window.location.pathname);
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
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {token && (
          <nav className="bg-white shadow-md p-4 mb-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">Tutor Connect</h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
          <Route 
            path="/dashboard" 
            element={
              token ? <Dashboard token={token} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/agendamento" 
            element={
              token ? <Agendamento token={token} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/avaliacao/:sessaoId" 
            element={
              token ? <Avaliacao token={token} /> : <Navigate to="/login" />
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