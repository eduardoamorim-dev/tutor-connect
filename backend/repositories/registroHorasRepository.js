const RegistroHoras = require("../models/RegistroHoras");

const registroHorasRepository = {
  /**
   * Create a new hour registration
   */
  async create(data) {
    const registro = new RegistroHoras(data);
    await registro.save();
    return registro;
  },

  /**
   * Find hour registration by ID
   */
  async findById(id) {
    return RegistroHoras.findById(id)
      .populate("tutor", "nome email nivel_academico")
      .populate("sessao")
      .populate("programa", "nome")
      .populate("aprovado_por", "nome email");
  },

  /**
   * Find hour registration by session ID
   */
  async findBySessao(sessaoId) {
    return RegistroHoras.findOne({ sessao: sessaoId });
  },

  /**
   * Find all hour registrations for a tutor in a specific program
   */
  async findByTutorAndProgram(tutorId, programId, filters = {}) {
    const query = {
      tutor: tutorId,
      programa: programId,
    };

    if (filters.status) {
      query.status = filters.status;
    }

    return RegistroHoras.find(query)
      .populate("sessao")
      .populate("aprovado_por", "nome")
      .sort({ data_sessao: -1 });
  },

  /**
   * Find tutor's hour registrations with filters and pagination
   */
  async findByTutorWithFilters(tutorId, filters = {}) {
    const query = { tutor: tutorId };

    if (filters.programId) {
      query.programa = filters.programId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    let q = RegistroHoras.find(query)
      .populate("programa", "nome")
      .populate("aprovado_por", "nome")
      .sort({ data_sessao: -1 });

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      q = q.skip(skip).limit(filters.limit);
    }

    const [data, total] = await Promise.all([q, RegistroHoras.countDocuments(query)]);

    return { data, total };
  },

  /**
   * Find program's hour registrations with filters and pagination
   */
  async findByProgramWithFilters(programId, filters = {}) {
    const query = { programa: programId };

    if (filters.status) {
      query.status = filters.status;
    }

    let q = RegistroHoras.find(query)
      .populate("tutor", "nome email nivel_academico")
      .populate("aprovado_por", "nome")
      .sort({ data_sessao: -1 });

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      q = q.skip(skip).limit(filters.limit);
    }

    const [data, total] = await Promise.all([q, RegistroHoras.countDocuments(query)]);

    return { data, total };
  },

  /**
   * Update hour registration status (for approval/rejection)
   */
  async updateStatus(id, status, approvedBy, observacao) {
    return RegistroHoras.findByIdAndUpdate(
      id,
      {
        status,
        aprovado_por: approvedBy,
        data_aprovacao: new Date(),
        observacao_aprovador: observacao,
      },
      { new: true },
    );
  },

  /**
   * Count hour registrations by status for a tutor in a program
   */
  async countByStatus(tutorId, programId) {
    const result = await RegistroHoras.aggregate([
      {
        $match: {
          tutor: tutorId,
          programa: programId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalHoras: { $sum: "$horas_registradas" },
        },
      },
    ]);

    const summary = {
      pendente: { count: 0, horas: 0 },
      aprovado: { count: 0, horas: 0 },
      rejeitado: { count: 0, horas: 0 },
    };

    result.forEach((item) => {
      summary[item._id] = {
        count: item.count,
        horas: item.totalHoras,
      };
    });

    return summary;
  },
};

module.exports = registroHorasRepository;
