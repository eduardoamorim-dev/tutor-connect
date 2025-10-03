import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isRegister ? 'http://localhost:5001/auth/register' : 'http://localhost:5001/auth/login';
      const data = isRegister ? { nome, email, senha } : { email, senha };
      const res = await axios.post(url, data);
      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
      alert(isRegister ? 'Cadastro realizado!' : 'Login realizado!');
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao processar requisição');
    }
  };

  const handleGoogleLogin = () => {
    // IMPORTANTE: Use window.open ou link direto, não axios
    // Isso abre em uma nova aba/janela para evitar CORS
    const googleAuthUrl = 'http://localhost:5001/auth/google';
    
    // Opção 1: Abrir na mesma aba (RECOMENDADO)
    window.location.href = googleAuthUrl;
    
    // Opção 2: Abrir em popup (alternativa)
    // const width = 500;
    // const height = 600;
    // const left = (window.screen.width / 2) - (width / 2);
    // const top = (window.screen.height / 2) - (height / 2);
    // window.open(
    //   googleAuthUrl,
    //   'Google Login',
    //   `width=${width},height=${height},left=${left},top=${top}`
    // );
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">{isRegister ? 'Cadastro' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 text-white p-2 rounded mt-2 hover:bg-red-600 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>
        
        <p className="mt-4 text-center text-gray-600">
          {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-blue-500 hover:underline"
          >
            {isRegister ? 'Faça login' : 'Cadastre-se'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;