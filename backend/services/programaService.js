const programaRepository = require("../repositories/programaRepository");
const instituicaoRepository = require("../repositories/instituicaoRepository");
const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

const programaService = {
  /**
   * Create a new program
   */
  async createPrograma(data) {
    // Verify institution exists
    const instituicao = await instituicaoRepository.findById(data.instituicaoId);

    if (!instituicao) {
      throw new AppError("Instituição não encontrada", 404);
    }

    // Create program with instituicao reference
    const programaData = {
      ...data,
      instituicao: data.instituicaoId,
    };
    delete programaData.instituicaoId;

    const programa = await programaRepository.create(programaData);

    logger.info(
      `Programa criado: ${programa.nome} na instituição ${instituicao.nome} (${programa._id})`,
    );

    return programa;
  },

  /**
   * Get program by ID
   */
  async getProgramaById(id) {
    const programa = await programaRepository.findByIdPopulated(id);

    if (!programa) {
      throw new AppError("Programa não encontrado", 404);
    }

    return programa;
  },

  /**
   * List programs with filters and pagination
   */
  async listProgramas(filters) {
    return programaRepository.findAll(filters);
  },

  /**
   * Update program
   */
  async updatePrograma(id, data) {
    const programa = await programaRepository.findById(id);

    if (!programa) {
      throw new AppError("Programa não encontrado", 404);
    }

    // If updating instituicao, verify it exists
    if (data.instituicaoId) {
      const instituicao = await instituicaoRepository.findById(data.instituicaoId);
      if (!instituicao) {
        throw new AppError("Instituição não encontrada", 404);
      }
      data.instituicao = data.instituicaoId;
      delete data.instituicaoId;
    }

    const updated = await programaRepository.update(id, data);

    logger.info(`Programa atualizado: ${updated.nome} (${updated._id})`);

    return updated;
  },

  /**
   * Assign coordinator to a program
   */
  async assignCoordinator(programId, userId) {
    const programa = await programaRepository.findById(programId);

    if (!programa) {
      throw new AppError("Programa não encontrado", 404);
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Verify user has coordinator or admin role
    if (user.role !== "coordinator" && user.role !== "admin") {
      throw new AppError("Usuário deve ter papel de coordenador ou administrador", 400);
    }

    // Assign coordinator to program
    const updated = await programaRepository.assignCoordinator(programId, userId);

    // Add program to user's coordinated programs
    if (!user.programas_coordenados) {
      user.programas_coordenados = [];
    }

    if (!user.programas_coordenados.some((p) => p.toString() === programId)) {
      user.programas_coordenados.push(programId);
      await user.save();
    }

    logger.info(
      `Coordenador atribuído: ${user.nome} para programa ${programa.nome} (${programId})`,
    );

    return updated;
  },

  /**
   * Get programs coordinated by a user
   */
  async getProgramasByCoordinator(coordinatorId) {
    const user = await userRepository.findById(coordinatorId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (user.role !== "coordinator" && user.role !== "admin") {
      throw new AppError("Usuário não é coordenador", 403);
    }

    return programaRepository.findByCoordinator(coordinatorId);
  },
};

module.exports = programaService;
