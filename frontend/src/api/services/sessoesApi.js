import api from "../axios";

const sessoesApi = {
  create(data) {
    return api.post("/sessoes/create", data);
  },

  getMinhasSessoes(params = {}) {
    return api.get("/sessoes/minhas-sessoes", { params });
  },

  getById(id) {
    return api.get(`/sessoes/${id}`);
  },

  confirmar(id) {
    return api.put(`/sessoes/${id}/confirmar`);
  },

  concluir(id) {
    return api.put(`/sessoes/${id}/concluir`);
  },

  cancelar(id, motivo) {
    return api.put(`/sessoes/${id}/cancelar`, { motivo });
  },

  avaliar(data) {
    return api.post("/sessoes/avaliar", data);
  },

  getAvaliacoesTutor(tutorId) {
    return api.get(`/sessoes/avaliacoes/tutor/${tutorId}`);
  },
};

export default sessoesApi;
