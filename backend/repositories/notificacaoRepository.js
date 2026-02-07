const Notificacao = require("../models/Notificacao");

const notificacaoRepository = {
  async create(data) {
    try {
      const notificacao = new Notificacao(data);
      await notificacao.save();
      return notificacao;
    } catch (error) {
      return null;
    }
  },

  async findByUser(userId, filters = {}) {
    const query = { usuario: userId };

    if (filters.apenasNaoLidas) {
      query.lida = false;
    }

    let q = Notificacao.find(query)
      .populate("sessao", "disciplina data_hora_inicio tutor aluno")
      .sort({ data_criacao: -1 });

    if (filters.limit) {
      q = q.limit(parseInt(filters.limit));
    }

    if (filters.page && filters.perPage) {
      const skip = (filters.page - 1) * filters.perPage;
      q = q.skip(skip).limit(filters.perPage);
    }

    const [data, total] = await Promise.all([
      q,
      Notificacao.countDocuments(query),
    ]);

    return { data, total };
  },

  async countUnread(userId) {
    return Notificacao.countDocuments({ usuario: userId, lida: false });
  },

  async markAsRead(id, userId) {
    const notificacao = await Notificacao.findOne({ _id: id, usuario: userId });
    if (!notificacao) return null;
    notificacao.lida = true;
    await notificacao.save();
    return notificacao;
  },

  async markAllAsRead(userId) {
    return Notificacao.updateMany(
      { usuario: userId, lida: false },
      { lida: true },
    );
  },

  async deleteById(id, userId) {
    return Notificacao.findOneAndDelete({ _id: id, usuario: userId });
  },

  async deleteAllRead(userId) {
    return Notificacao.deleteMany({ usuario: userId, lida: true });
  },
};

module.exports = notificacaoRepository;
