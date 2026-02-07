import api from "../axios";

const notificacoesApi = {
  list(params = {}) {
    return api.get("/notificacoes", { params });
  },

  count() {
    return api.get("/notificacoes/count");
  },

  markRead(id) {
    return api.put(`/notificacoes/${id}/ler`);
  },

  markAllRead() {
    return api.put("/notificacoes/ler-todas");
  },

  deleteOne(id) {
    return api.delete(`/notificacoes/${id}`);
  },

  deleteAllRead() {
    return api.delete("/notificacoes");
  },
};

export default notificacoesApi;
