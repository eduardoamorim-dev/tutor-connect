const Instituicao = require("../models/Instituicao");

const instituicaoRepository = {
  /**
   * Create a new institution
   */
  async create(data) {
    const instituicao = new Instituicao(data);
    await instituicao.save();
    return instituicao;
  },

  /**
   * Find institution by ID
   */
  async findById(id) {
    return Instituicao.findById(id);
  },

  /**
   * Find all institutions with filters and pagination
   */
  async findAll(filters = {}) {
    const query = {};

    if (filters.ativo !== undefined) {
      query.ativo = filters.ativo;
    }

    let q = Instituicao.find(query).sort({ nome: 1 });

    if (filters.page && filters.limit) {
      const skip = (filters.page - 1) * filters.limit;
      q = q.skip(skip).limit(filters.limit);
    }

    const [data, total] = await Promise.all([q, Instituicao.countDocuments(query)]);

    return { data, total };
  },

  /**
   * Update institution by ID
   */
  async update(id, data) {
    return Instituicao.findByIdAndUpdate(id, data, { new: true });
  },

  /**
   * Find institution by name (case-insensitive)
   */
  async findByName(nome) {
    return Instituicao.findOne({ nome: new RegExp(`^${nome}$`, "i") });
  },

  /**
   * Find institution by sigla
   */
  async findBySigla(sigla) {
    return Instituicao.findOne({ sigla: sigla.toUpperCase() });
  },
};

module.exports = instituicaoRepository;
