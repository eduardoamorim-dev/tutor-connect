import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMyCoordinatedPrograms } from "../hooks/useInstitutionsPrograms";
import HoursApprovalTable from "../components/hours/HoursApprovalTable";
import "./CoordinatorDashboard.css";

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const { data: programs, isLoading, isError } = useMyCoordinatedPrograms();
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Check if user has coordinator role
  if (user?.role !== "coordinator" && user?.role !== "admin") {
    return (
      <div className="coordinator-dashboard unauthorized">
        <div className="unauthorized-message">
          <h2>Acesso Negado</h2>
          <p>Você precisa ser coordenador para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="coordinator-dashboard loading">
        <h2>Painel do Coordenador</h2>
        <p>Carregando programas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="coordinator-dashboard error">
        <h2>Painel do Coordenador</h2>
        <p>Erro ao carregar programas coordenados</p>
      </div>
    );
  }

  // Extract programas array from response (backend returns { programas: [...] })
  const programsList = programs?.programas || [];

  if (!programsList || programsList.length === 0) {
    return (
      <div className="coordinator-dashboard empty">
        <h2>Painel do Coordenador</h2>
        <div className="empty-state">
          <p>Você não foi designado como coordenador de nenhum programa.</p>
          {user?.role === "admin" ? (
            <p className="hint">
              Como administrador, você pode atribuir coordenadores aos programas através do painel administrativo.
            </p>
          ) : (
            <p className="hint">
              Entre em contato com o administrador do sistema para ser designado como coordenador.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Auto-select first program if none selected
  const activeProgram = selectedProgram || programsList[0];

  return (
    <div className="coordinator-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Painel do Coordenador</h1>
          <p className="welcome-text">
            Bem-vindo(a), {user.nome} - Gerencie aprovações de horas-aula
          </p>
        </div>
      </div>

      <div className="dashboard-body">
        {programsList.length > 1 && (
          <div className="program-selector">
            <label htmlFor="program-select">
              <strong>Programa:</strong>
            </label>
            <select
              id="program-select"
              value={activeProgram?._id || ""}
              onChange={(e) =>
                setSelectedProgram(programsList.find((p) => p._id === e.target.value))
              }
            >
              {programsList.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.nome} - {program.instituicao?.nome || "N/A"} ({program.nivel})
                </option>
              ))}
            </select>
          </div>
        )}

        {programsList.length === 1 && activeProgram && (
          <div className="program-info">
            <h3>{activeProgram.nome}</h3>
            <p className="program-details">
              {activeProgram.instituicao?.nome || "N/A"} • {activeProgram.nivel}
              {activeProgram.horas_aula_obrigatorias &&
                ` • ${activeProgram.horas_aula_obrigatorias}h obrigatórias`}
            </p>
          </div>
        )}

        {activeProgram && (
          <div className="approval-section">
            <HoursApprovalTable programId={activeProgram._id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
