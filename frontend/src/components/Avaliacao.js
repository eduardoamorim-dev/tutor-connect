import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Avaliacao({ token }) {
  const { sessaoId } = useParams();
  const [nota, setNota] = useState(1);
  const [comentario, setComentario] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5001/sessoes/avaliar',
        { sessaoId, nota, comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Avaliação enviada!');
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Avaliar Sessão</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <select
          value={nota}
          onChange={(e) => setNota(Number(e.target.value))}
          className="w-full p-2 mb-4 border rounded"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <textarea
          placeholder="Comentário"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Enviar Avaliação
        </button>
      </form>
    </div>
  );
}

export default Avaliacao;