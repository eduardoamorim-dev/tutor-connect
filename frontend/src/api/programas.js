import api from "./axios";

/**
 * API client for Programs (Programas)
 */

// List all programs
export const getPrograms = async (filters = {}) => {
  const { data } = await api.get("/programas", { params: filters });
  return data;
};

// Get program by ID
export const getProgramById = async (id) => {
  const { data } = await api.get(`/programas/${id}`);
  return data;
};

// Create program (Admin only)
export const createProgram = async (programData) => {
  const { data } = await api.post("/programas", programData);
  return data;
};

// Update program (Coordinator or Admin)
export const updateProgram = async (id, programData) => {
  const { data } = await api.patch(`/programas/${id}`, programData);
  return data;
};

// Assign coordinator to program (Admin only)
export const assignCoordinator = async (programId, userId) => {
  const { data } = await api.post(`/programas/${programId}/coordenador`, {
    userId,
  });
  return data;
};

// Get programs coordinated by current user
export const getMyCoordinatedPrograms = async () => {
  const { data } = await api.get("/programas/coordenador/meus-programas");
  return data;
};
