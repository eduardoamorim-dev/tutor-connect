import React, { useState } from "react";
import { useMyHours } from "../../hooks/useHours";
import "./HoursTrackingModal.css";

const HoursTrackingModal = ({ programId, onClose }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const filters = {
    programId,
    ...(statusFilter !== "all" && { status: statusFilter }),
    page: currentPage,
    limit,
  };

  const { data, isLoading, isError } = useMyHours(filters);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatHours = (hours) => {
    return hours.toFixed(2) + "h";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pendente: { label: "Pendente", className: "status-pending" },
      aprovado: { label: "Aprovado", className: "status-approved" },
      rejeitado: { label: "Rejeitado", className: "status-rejected" },
    };
    const { label, className } = statusMap[status] || {};
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content hours-modal">
        <div className="modal-header">
          <h2>Detalhes de Horas-Aula</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-filters">
          <label>
            Filtrar por status:
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </label>
        </div>

        <div className="modal-body">
          {isLoading && <div className="loading">Carregando...</div>}

          {isError && <div className="error">Erro ao carregar registros de horas</div>}

          {data && data.data.length === 0 && (
            <div className="empty-state">Nenhum registro de horas encontrado</div>
          )}

          {data && data.data.length > 0 && (
            <>
              <div className="table-responsive">
                <table className="hours-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Disciplina</th>
                      <th>Horas</th>
                      <th>Status</th>
                      <th>Aprovado Por</th>
                      <th>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((registro) => (
                      <tr key={registro._id}>
                        <td>{formatDate(registro.data_sessao)}</td>
                        <td>{registro.disciplina}</td>
                        <td className="hours-cell">{formatHours(registro.horas_registradas)}</td>
                        <td>{getStatusBadge(registro.status)}</td>
                        <td>{registro.aprovado_por ? registro.aprovado_por.nome : "-"}</td>
                        <td className="observacao-cell">{registro.observacao_aprovador || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span className="page-info">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </div>
              )}

              <div className="total-info">Total de registros: {data.total}</div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoursTrackingModal;
