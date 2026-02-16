const instituicaoRepository = require("../repositories/instituicaoRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

const instituicaoService = {
  /**
   * Create a new institution
   */
  async createInstituicao(data) {
    // Check for duplicate name
    const existing = await instituicaoRepository.findByName(data.nome);

    if (existing) {
      throw new AppError("Instituição com este nome já existe", 400);
    }

    // Check for duplicate sigla
    if (data.sigla) {
      const existingSigla = await instituicaoRepository.findBySigla(data.sigla);
      if (existingSigla) {
        throw new AppError("Instituição com esta sigla já existe", 400);
      }
    }

    const instituicao = await instituicaoRepository.create(data);

    logger.info(`Instituição criada: ${instituicao.nome} (${instituicao._id})`);

    return instituicao;
  },

  /**
   * Get institution by ID
   */
  async getInstituicaoById(id) {
    const instituicao = await instituicaoRepository.findById(id);

    if (!instituicao) {
      throw new AppError("Instituição não encontrada", 404);
    }

    return instituicao;
  },

  /**
   * List institutions with filters and pagination
   */
  async listInstituicoes(filters) {
    return instituicaoRepository.findAll(filters);
  },

  /**
   * Update institution
   */
  async updateInstituicao(id, data) {
    const instituicao = await instituicaoRepository.findById(id);

    if (!instituicao) {
      throw new AppError("Instituição não encontrada", 404);
    }

    // Check for duplicate name if changing
    if (data.nome && data.nome !== instituicao.nome) {
      const existingName = await instituicaoRepository.findByName(data.nome);
      if (existingName) {
        throw new AppError("Já existe uma instituição com este nome", 400);
      }
    }

    // Check for duplicate sigla if changing
    if (data.sigla && data.sigla !== instituicao.sigla) {
      const existingSigla = await instituicaoRepository.findBySigla(data.sigla);
      if (existingSigla) {
        throw new AppError("Já existe uma instituição com esta sigla", 400);
      }
    }

    const updated = await instituicaoRepository.update(id, data);

    logger.info(`Instituição atualizada: ${updated.nome} (${updated._id})`);

    return updated;
  },
};

module.exports = instituicaoService;
