const userRepository = require("../repositories/userRepository");
const avaliacaoRepository = require("../repositories/avaliacaoRepository");
const { AppError } = require("../middleware/errorHandler");

const userService = {
  async getTutors(filters = {}) {
    return userRepository.findTutors(filters);
  },

  async getTutorProfile(tutorId) {
    const tutor = await userRepository.findById(tutorId);

    if (!tutor || !tutor.isTutor) {
      throw new AppError("Tutor não encontrado", 404);
    }

    const { data: avaliacoes } = await avaliacaoRepository.findByTutor(tutorId, { limit: 10 });

    return { tutor, avaliacoes };
  },

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return user;
  },

  async updateProfile(userId, data) {
    const updateData = { profileCompleted: true };

    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.localizacao !== undefined) updateData.localizacao = data.localizacao;
    if (data.isTutor !== undefined) updateData.isTutor = data.isTutor;
    if (data.disciplinas_dominadas !== undefined)
      updateData.disciplinas_dominadas = data.disciplinas_dominadas;
    if (data.disciplinas_precisa !== undefined)
      updateData.disciplinas_precisa = data.disciplinas_precisa;
    if (data.disponibilidade !== undefined) updateData.disponibilidade = data.disponibilidade;

    if (data.isTutor === false) {
      updateData.disciplinas_dominadas = [];
      updateData.disponibilidade = [];
    }

    const user = await userRepository.updateById(userId, updateData);
    return user;
  },

  async getUserCount() {
    return userRepository.countByRole();
  },

  /**
   * Update user's academic profile
   */
  async updateAcademicProfile(userId, data) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const updateData = {};

    if (data.nivel_academico !== undefined) {
      updateData.nivel_academico = data.nivel_academico;
    }
    if (data.instituicao !== undefined) {
      updateData.instituicao = data.instituicao;
    }
    if (data.programa !== undefined) {
      updateData.programa = data.programa;
    }
    if (data.lattes_url !== undefined) {
      updateData.lattes_url = data.lattes_url;
    }
    if (data.orcid !== undefined) {
      updateData.orcid = data.orcid;
    }
    if (data.linha_pesquisa !== undefined) {
      updateData.linha_pesquisa = data.linha_pesquisa;
    }
    if (data.area_concentracao !== undefined) {
      updateData.area_concentracao = data.area_concentracao;
    }

    const updatedUser = await userRepository.updateById(userId, updateData);
    return updatedUser;
  },

  /**
   * Update user's role (admin only)
   */
  async updateUserRole(userId, role) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // If setting role to tutor, also set isTutor to true
    const updateData = { role };
    if (role === "tutor" && !user.isTutor) {
      updateData.isTutor = true;
    }

    const updatedUser = await userRepository.updateById(userId, updateData);
    return updatedUser;
  },
};

module.exports = userService;
