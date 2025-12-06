import React, { useState, useEffect } from "react";
import axios from "axios";

function Agendamento({ token }) {
  const [tutores, setTutores] = useState([]);
  const [tutorId, setTutorId] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [data_hora_inicio, setDataHoraInicio] = useState("");
  const [data_hora_fim, setDataHoraFim] = useState("");

  useEffect(() => {
    const fetchTutores = async () => {
      try {
        const res = await axios.get("http://localhost:5001/users/tutores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTutores(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTutores();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5001/sessoes/create",
        { tutorId, disciplina, data_hora_inicio, data_hora_fim },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Sessão agendada!");
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Agendar Sessão</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <select
          value={tutorId}
          onChange={(e) => setTutorId(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="">Selecione um tutor</option>
          {tutores.map((tutor) => (
            <option key={tutor._id} value={tutor._id}>
              {tutor.nome}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Disciplina"
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="datetime-local"
          value={data_hora_inicio}
          onChange={(e) => setDataHoraInicio(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="datetime-local"
          value={data_hora_fim}
          onChange={(e) => setDataHoraFim(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Agendar
        </button>
      </form>
    </div>
  );
}

export default Agendamento;
