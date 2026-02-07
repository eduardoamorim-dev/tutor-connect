const Avaliacao = require("../models/Avaliacao");

const avaliacaoRepository = {
  async create(data) {
    const avaliacao = new Avaliacao(data);
    await avaliacao.save();
    return avaliacao;
  },

  async findByTutor(tutorId, options = {}) {
    let q = Avaliacao.find({ tutor: tutorId })
      .populate("aluno", "nome")
      .populate("sessao", "disciplina data_hora_inicio")
      .sort({ data: -1 });

    if (options.limit) {
      q = q.limit(options.limit);
    }

    if (options.page && options.perPage) {
      const skip = (options.page - 1) * options.perPage;
      q = q.skip(skip).limit(options.perPage);
    }

    const [data, total] = await Promise.all([
      q,
      Avaliacao.countDocuments({ tutor: tutorId }),
    ]);

    return { data, total };
  },

  async findBySessao(sessaoId) {
    return Avaliacao.findOne({ sessao: sessaoId });
  },

  async calcularMediaTutor(tutorId) {
    const result = await Avaliacao.aggregate([
      { $match: { tutor: tutorId } },
      {
        $group: {
          _id: "$tutor",
          media: { $avg: "$nota" },
          total: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { media: 0, total: 0 };
    }

    return {
      media: Math.round(result[0].media * 10) / 10,
      total: result[0].total,
    };
  },
};

module.exports = avaliacaoRepository;
