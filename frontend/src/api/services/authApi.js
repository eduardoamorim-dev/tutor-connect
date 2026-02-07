import api from "../axios";

const authApi = {
  verify() {
    return api.get("/auth/verify");
  },

  getGoogleAuthUrl() {
    return `${api.defaults.baseURL}/auth/google`;
  },
};

export default authApi;
