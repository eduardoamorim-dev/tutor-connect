import api from "./axios";

/**
 * API client for Hours Tracking (Controle de Horas)
 */

// Get hours summary for authenticated tutor
export const getHoursSummary = async (programId) => {
  const { data } = await api.get("/horas/resumo", {
    params: { programId },
  });
  return data;
};

// Get all hour registrations for authenticated tutor
export const getMyHours = async (filters = {}) => {
  const { data } = await api.get("/horas/meus-registros", { params: filters });
  return data;
};

// Get all hour registrations for a program (Coordinator only)
export const getProgramHours = async (programId, filters = {}) => {
  const { data } = await api.get(`/horas/programa/${programId}`, {
    params: filters,
  });
  return data;
};

// Get pending hours for coordinator to review
export const getPendingHours = async (filters = {}) => {
  const { data } = await api.get("/horas/pendentes", { params: filters });
  return data;
};

// Get single hour registration details
export const getHourRegistrationById = async (id) => {
  const { data } = await api.get(`/horas/${id}`);
  return data;
};

// Approve or reject hour registration (Coordinator only)
export const approveHours = async (id, aprovado, observacao = "") => {
  const { data } = await api.post(`/horas/${id}/aprovar`, {
    aprovado,
    observacao,
  });
  return data;
};

// Bulk approve multiple hour registrations (Coordinator only)
export const bulkApproveHours = async (registroIds) => {
  const { data } = await api.post("/horas/aprovar-lote", { registroIds });
  return data;
};

// Export hour report as PDF
export const exportHoursPDF = async (programId) => {
  const response = await api.get("/horas/exportar-pdf", {
    params: { programId },
    responseType: "blob",
  });
  return response.data;
};

// Helper to download PDF
export const downloadHoursPDF = async (programId, filename) => {
  const blob = await exportHoursPDF(programId);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `relatorio-horas-${Date.now()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
