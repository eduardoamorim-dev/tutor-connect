import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard({ token }) {
  const [sessoes, setSessoes] = useState([]);

  useEffect(() => {
    const fetchSessoes = async () => {
      try {
        const res = await axios.get('http://localhost:5001/sessoes/minhas-sessoes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessoes(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSessoes();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Minhas Sessões</h1>
      <Link to="/agendamento" className="bg-blue-500 text-white p-2 rounded mb-4 inline-block">
        Agendar Nova Sessão
      </Link>
      <div>
        {sessoes.map((sessao) => (
          <div key={sessao._id} className="border p-4 mb-2 rounded">
            <p><strong>Disciplina:</strong> {sessao.disciplina}</p>
            <p><strong>Tutor:</strong> {sessao.tutor.nome}</p>
            <p><strong>Data:</strong> {new Date(sessao.data_hora_inicio).toLocaleString()}</p>
            {sessao.link_meet && <a href={sessao.link_meet} className="text-blue-500">Entrar no Meet</a>}
            {sessao.avaliacao_pendente && (
              <Link to={`/avaliacao/${sessao._id}`} className="text-green-500">Avaliar Sessão</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;