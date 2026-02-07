import api from "../axios";

const usersApi = {
  getTutors(params = {}) {
    return api.get("/users/tutores", { params });
  },

  getTutorProfile(tutorId) {
    return api.get(`/users/tutor/${tutorId}`);
  },

  getProfile() {
    return api.get("/users/profile");
  },

  updateProfile(data) {
    return api.put("/users/profile", data);
  },

  addDisponibilidade(data) {
    return api.post("/users/disponibilidade", data);
  },

  getTutorDisponibilidade(tutorId) {
    return api.get(`/users/tutor/${tutorId}/disponibilidade`);
  },

  removeDisponibilidade(id) {
    return api.delete(`/users/disponibilidade/${id}`);
  },

  getContagem() {
    return api.get("/users/contagem");
  },
};

export default usersApi;
