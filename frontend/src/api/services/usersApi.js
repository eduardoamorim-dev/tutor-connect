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

  updateAcademicProfile(data) {
    return api.patch("/users/perfil-academico", data);
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

  searchByEmail(email) {
    return api.get("/users/search-by-email", { params: { email } });
  },

  updateUserRole(userId, role) {
    return api.patch(`/users/${userId}/role`, { role });
  },
};

export default usersApi;
