const Programa = require("../models/Programa");

const programaRepository = {
  /**
   * Create a new program
   */
  async create(data) {
    const programa = new Programa(data);
    await programa.save();
    return programa;
  },

  /**
   * Find program by ID
   */
  async findById(id) {
    return Programa.findById(id);
  },

  /**
   * Find program by ID with populated fields
   */
  async findByIdPopulated(id) {
    return Programa.findById(id)
      .populate("instituicao")
      .populate("coordenador", "nome email role")
      .populate("vice_coordenadores", "nome email role");
  },

  /**
   * Find all programs with filters and pagination
   */
  async findAll(filters = {}) {
    const query = {};

    if (filters.instituicaoId) {
      query.instituicao = filters.instituicaoId;
    }

    if (filters.nivel) {
      query.nivel = filters.nivel;
    }

    if (filters.ativo !== undefined) {
      query.ativo = filters.ativo;
    }

    let q = Programa.find(query)
      .populate("instituicao", "nome sigla")
      .populate("coordenador", "nome email")
      .sort({ nome: 1 });

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      q = q.skip(skip).limit(filters.limit);
    }

    const [data, total] = await Promise.all([q, Programa.countDocuments(query)]);

    return { data, total };
  },

  /**
   * Update program by ID
   */
  async update(id, data) {
    return Programa.findByIdAndUpdate(id, data, { new: true });
  },

  /**
   * Assign coordinator to a program
   */
  async assignCoordinator(programId, userId) {
    return Programa.findByIdAndUpdate(programId, { coordenador: userId }, { new: true }).populate(
      "coordenador",
      "nome email role",
    );
  },

  /**
   * Find programs by coordinator
   */
  async findByCoordinator(coordinatorId) {
    return Programa.find({
      $or: [{ coordenador: coordinatorId }, { vice_coordenadores: coordinatorId }],
      ativo: true,
    })
      .populate("instituicao", "nome sigla")
      .sort({ nome: 1 });
  },
};

module.exports = programaRepository;
