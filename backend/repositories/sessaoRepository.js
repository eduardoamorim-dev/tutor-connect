const Sessao = require("../models/Sessao");

const sessaoRepository = {
  async create(sessaoData) {
    const sessao = new Sessao(sessaoData);
    await sessao.save();
    return sessao;
  },

  async findById(id) {
    return Sessao.findById(id);
  },

  async findByIdPopulated(id) {
    return Sessao.findById(id)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email")
      .populate("avaliacao");
  },

  async findByUser(userId, filters = {}) {
    let query = {
      $or: [{ tutor: userId }, { aluno: userId }],
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.tipo === "tutor") {
      query = { tutor: userId };
      if (filters.status) query.status = filters.status;
    } else if (filters.tipo === "aluno") {
      query = { aluno: userId };
      if (filters.status) query.status = filters.status;
    }

    let q = Sessao.find(query)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email")
      .populate("avaliacao")
      .sort({ data_hora_inicio: -1 });

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      q = q.skip(skip).limit(filters.limit);
    }

    const [data, total] = await Promise.all([q, Sessao.countDocuments(query)]);

    return { data, total };
  },

  async findConflicting(tutorId, dataInicio, dataFim, excludeId = null) {
    const query = {
      tutor: tutorId,
      status: { $in: ["Pendente", "Confirmada"] },
      $or: [
        {
          data_hora_inicio: { $lt: dataFim },
          data_hora_fim: { $gt: dataInicio },
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return Sessao.findOne(query);
  },

  async findPendingExpired() {
    return Sessao.find({
      status: "Pendente",
      data_hora_fim: { $lt: new Date() },
    });
  },

  async findByTutorFuture(tutorId) {
    return Sessao.find({
      tutor: tutorId,
      data_hora_inicio: { $gte: new Date() },
      status: { $in: ["Pendente", "Confirmada"] },
    }).select("data_hora_inicio data_hora_fim");
  },

  async updateStatus(id, status, extras = {}) {
    const sessao = await Sessao.findById(id);
    if (!sessao) return null;

    sessao.status = status;
    Object.assign(sessao, extras);
    await sessao.save();
    return sessao;
  },
};

module.exports = sessaoRepository;
