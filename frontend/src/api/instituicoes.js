import api from "./axios";

/**
 * API client for Institutions (Instituições)
 */

// List all institutions
export const getInstitutions = async (filters = {}) => {
  const { data } = await api.get("/instituicoes", { params: filters });
  return data;
};

// Get institution by ID
export const getInstitutionById = async (id) => {
  const { data } = await api.get(`/instituicoes/${id}`);
  return data;
};

// Create institution (Admin only)
export const createInstitution = async (institutionData) => {
  const { data } = await api.post("/instituicoes", institutionData);
  return data;
};

// Update institution (Admin only)
export const updateInstitution = async (id, institutionData) => {
  const { data } = await api.patch(`/instituicoes/${id}`, institutionData);
  return data;
};
