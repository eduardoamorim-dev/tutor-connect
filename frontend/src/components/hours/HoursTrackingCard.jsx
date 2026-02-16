import React, { useState } from "react";
import { useHoursSummary, useDownloadHoursPDF } from "../../hooks/useHours";
import { useAuth } from "../../contexts/AuthContext";
import HoursTrackingModal from "./HoursTrackingModal";
import "./HoursTrackingCard.css";

const HoursTrackingCard = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const downloadPDF = useDownloadHoursPDF();

  // Only show if user has a program
  const programId = user?.programa;

  const { data: summary, isLoading, isError } = useHoursSummary(programId);

  if (!programId) {
    return null; // Don't show card if user doesn't have a program
  }

  if (isLoading) {
    return (
      <div className="hours-tracking-card loading">
        <h3>Controle de Horas-Aula</h3>
        <p>Carregando...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="hours-tracking-card error">
        <h3>Controle de Horas-Aula</h3>
        <p>Erro ao carregar dados de horas</p>
      </div>
    );
  }

  const {
    horas_obrigatorias,
    horas_aprovadas,
    horas_pendentes,
    saldo,
    percentual_cumprido,
    meta_atingida,
    programa,
  } = summary;

  const handleDownloadPDF = async () => {
    try {
      await downloadPDF.mutateAsync({
        programId,
        filename: `relatorio-horas-${programa.nome}.pdf`,
      });
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao baixar relatório. Certifique-se de ter horas aprovadas.");
    }
  };

  return (
    <>
      <div className="hours-tracking-card">
        <div className="hours-header">
          <h3>Controle de Horas-Aula</h3>
          <span className="program-badge">{programa.nome}</span>
        </div>

        <div className="hours-progress">
          <div className="progress-bar">
            <div
              className={`progress-fill ${meta_atingida ? "completed" : ""}`}
              style={{ width: `${Math.min(percentual_cumprido, 100)}%` }}
            ></div>
          </div>
          <div className="progress-text">
            <span className="hours-approved">{horas_aprovadas.toFixed(1)}h aprovadas</span>
            <span className="hours-required">de {horas_obrigatorias}h obrigatórias</span>
          </div>
          <div className="progress-percentage">{percentual_cumprido.toFixed(0)}% cumprido</div>
        </div>

        <div className="hours-summary">
          <div className="summary-item">
            <span className="label">Pendentes:</span>
            <span className="value pending">{horas_pendentes.toFixed(1)}h</span>
          </div>
          <div className="summary-item">
            <span className="label">Saldo:</span>
            <span className={`value ${saldo >= 0 ? "positive" : "negative"}`}>
              {saldo >= 0 ? "+" : ""}
              {saldo.toFixed(1)}h
            </span>
          </div>
        </div>

        {meta_atingida && <div className="meta-atingida-badge">✓ Meta atingida!</div>}

        <div className="hours-actions">
          <button className="btn-secondary" onClick={() => setShowModal(true)}>
            Ver Detalhes
          </button>
          <button
            className="btn-primary"
            onClick={handleDownloadPDF}
            disabled={downloadPDF.isPending || horas_aprovadas === 0}
          >
            {downloadPDF.isPending ? "Gerando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      {showModal && (
        <HoursTrackingModal programId={programId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default HoursTrackingCard;
