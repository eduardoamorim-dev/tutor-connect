const User = require("../models/User");

const userRepository = {
  async findById(id, selectFields = "-senha -googleAccessToken -googleRefreshToken") {
    return User.findById(id).select(selectFields);
  },

  async findByIdFull(id) {
    return User.findById(id);
  },

  async findByEmail(email) {
    return User.findOne({ email });
  },

  async findTutors(filters = {}, selectFields) {
    const query = {
      isTutor: true,
      profileCompleted: true,
    };

    if (filters.excludeUserId) {
      query._id = { $ne: filters.excludeUserId };
    }

    if (filters.disciplina) {
      query["disciplinas_dominadas.disciplina"] = {
        $regex: filters.disciplina,
        $options: "i",
      };
    }

    if (filters.dia) {
      query["disponibilidade.dia"] = filters.dia;
    }

    const defaultSelect = "nome email bio disciplinas_dominadas disponibilidade localizacao rating total_avaliacoes total_sessoes";
    let q = User.find(query, selectFields || defaultSelect).sort({ rating: -1, total_sessoes: -1 });

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      q = q.skip(skip).limit(filters.limit);
    }

    const [data, total] = await Promise.all([
      q,
      User.countDocuments(query),
    ]);

    return { data, total };
  },

  async create(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  },

  async updateById(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true })
      .select("-senha -googleAccessToken -googleRefreshToken");
  },

  async countByRole() {
    const [totalTutores, totalAlunos] = await Promise.all([
      User.countDocuments({ isTutor: true, email: { $exists: true, $ne: "" } }),
      User.countDocuments({ email: { $exists: true, $ne: "" } }),
    ]);
    return { totalTutores, totalAlunos };
  },

  async addDisponibilidade(userId, slot) {
    const user = await User.findById(userId);
    if (!user) return null;
    user.disponibilidade.push(slot);
    await user.save();
    return user.disponibilidade;
  },

  async removeDisponibilidade(userId, slotId) {
    const user = await User.findById(userId);
    if (!user) return null;

    const index = user.disponibilidade.findIndex(
      (d) => d._id.toString() === slotId,
    );
    if (index === -1) return null;

    const removed = user.disponibilidade[index];
    user.disponibilidade.splice(index, 1);
    await user.save();
    return { removed, disponibilidade: user.disponibilidade };
  },

  async updateGoogleTokens(userId, tokens) {
    const updateData = {};
    if (tokens.access_token) updateData.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) updateData.googleRefreshToken = tokens.refresh_token;
    if (tokens.expiry_date) updateData.googleTokenExpiry = new Date(tokens.expiry_date);
    return User.findByIdAndUpdate(userId, updateData, { new: true });
  },

  async updateRating(userId, rating, totalAvaliacoes, avaliacaoId) {
    const update = {
      rating,
      total_avaliacoes: totalAvaliacoes,
    };
    if (avaliacaoId) {
      update.$push = { avaliacoes_recebidas: avaliacaoId };
    }
    return User.findByIdAndUpdate(userId, avaliacaoId ? { ...update } : update, { new: true });
  },

  async pushSessao(userId, sessaoId, incrementTotal = false) {
    const update = { $push: { sessoes_participadas: sessaoId } };
    if (incrementTotal) {
      update.$inc = { total_sessoes: 1 };
    }
    return User.findByIdAndUpdate(userId, update);
  },
};

module.exports = userRepository;
