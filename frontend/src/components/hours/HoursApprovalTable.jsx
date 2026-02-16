import React, { useState } from "react";
import { usePendingHours, useApproveHours, useBulkApproveHours } from "../../hooks/useHours";
import "./HoursApprovalTable.css";

const HoursApprovalTable = ({ programId }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    tutor: "",
    disciplina: "",
  });

  const limit = 15;

  const { data, isLoading, isError, refetch } = usePendingHours({
    programId,
    page: currentPage,
    limit,
    ...(filters.tutor && { tutor: filters.tutor }),
    ...(filters.disciplina && { disciplina: filters.disciplina }),
  });

  const approveMutation = useApproveHours();
  const bulkApproveMutation = useBulkApproveHours();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data.data.map((registro) => registro._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleApprove = async (registroId) => {
    const observacao = prompt("Observação (opcional):");
    if (observacao === null) return; // User cancelled

    try {
      await approveMutation.mutateAsync({
        id: registroId,
        aprovado: true,
        observacao: observacao || undefined,
      });
      setSelectedIds(selectedIds.filter((id) => id !== registroId));
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      alert("Erro ao aprovar registro. Tente novamente.");
    }
  };

  const handleReject = async (registroId) => {
    const observacao = prompt("Motivo da rejeição:");
    if (!observacao) {
      alert("Você deve fornecer um motivo para rejeitar o registro.");
      return;
    }

    try {
      await approveMutation.mutateAsync({
        id: registroId,
        aprovado: false,
        observacao,
      });
      setSelectedIds(selectedIds.filter((id) => id !== registroId));
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      alert("Erro ao rejeitar registro. Tente novamente.");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert("Selecione pelo menos um registro para aprovar.");
      return;
    }

    const confirmed = window.confirm(
      `Deseja aprovar ${selectedIds.length} registro(s) selecionado(s)?`,
    );
    if (!confirmed) return;

    try {
      await bulkApproveMutation.mutateAsync({ registroIds: selectedIds });
      setSelectedIds([]);
    } catch (error) {
      console.error("Erro ao aprovar em lote:", error);
      alert("Erro ao aprovar registros. Tente novamente.");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatHours = (hours) => {
    return hours.toFixed(2) + "h";
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  if (isLoading) {
    return (
      <div className="approval-table-container">
        <div className="loading">Carregando registros pendentes...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="approval-table-container">
        <div className="error">
          Erro ao carregar registros pendentes.{" "}
          <button onClick={() => refetch()}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="approval-table-container">
        <div className="empty-state">
          <p>Nenhum registro pendente de aprovação.</p>
          <p className="hint">Os registros aprovados ou rejeitados não aparecem nesta lista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approval-table-container">
      <div className="table-header">
        <h2>Registros Pendentes de Aprovação</h2>
        <div className="header-actions">
          {selectedIds.length > 0 && (
            <button
              className="btn-bulk-approve"
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
            >
              {bulkApproveMutation.isPending
                ? "Aprovando..."
                : `Aprovar Selecionados (${selectedIds.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="table-filters">
        <input
          type="text"
          placeholder="Filtrar por tutor..."
          value={filters.tutor}
          onChange={(e) => handleFilterChange("tutor", e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrar por disciplina..."
          value={filters.disciplina}
          onChange={(e) => handleFilterChange("disciplina", e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="approval-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === data.data.length && data.data.length > 0}
                />
              </th>
              <th>Data</th>
              <th>Tutor</th>
              <th>Disciplina</th>
              <th>Horas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((registro) => (
              <tr key={registro._id}>
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(registro._id)}
                    onChange={(e) => handleSelectOne(registro._id, e.target.checked)}
                  />
                </td>
                <td>{formatDate(registro.data_sessao)}</td>
                <td>
                  <div className="tutor-info">
                    <span className="tutor-name">{registro.tutor.nome}</span>
                    <span className="tutor-email">{registro.tutor.email}</span>
                  </div>
                </td>
                <td>{registro.disciplina}</td>
                <td className="hours-cell">{formatHours(registro.horas_registradas)}</td>
                <td className="actions-cell">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(registro._id)}
                    disabled={approveMutation.isPending}
                  >
                    Aprovar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(registro._id)}
                    disabled={approveMutation.isPending}
                  >
                    Rejeitar
                  </button>
                </td>
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

      <div className="total-info">Total de registros pendentes: {data.total}</div>
    </div>
  );
};

export default HoursApprovalTable;
