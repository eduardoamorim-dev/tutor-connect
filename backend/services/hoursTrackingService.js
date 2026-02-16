const registroHorasRepository = require("../repositories/registroHorasRepository");
const programaRepository = require("../repositories/programaRepository");
const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

const hoursTrackingService = {
  /**
   * Automatically create RegistroHoras when session is completed
   * Called from sessionService.completeSession()
   * This is idempotent - won't create duplicates
   *
   * @param {string} sessaoId - The session ID
   * @returns {Object} The created RegistroHoras or null if tutor has no program
   */
  async createHoursFromSession(sessaoId) {
    // Get session with populated tutor info
    const Sessao = require("../models/Sessao");
    const sessao = await Sessao.findById(sessaoId).populate("tutor").populate("aluno");

    if (!sessao) {
      throw new AppError("Sessão não encontrada", 404);
    }

    // Get full tutor info with programa
    const tutor = await userRepository.findById(sessao.tutor._id);

    // Only track hours for tutors who have a program
    if (!tutor.programa) {
      logger.info(
        `Tutor ${tutor._id} não tem programa vinculado, horas não registradas para sessão ${sessaoId}`,
      );
      return null;
    }

    // Check if registro already exists (idempotency)
    const existing = await registroHorasRepository.findBySessao(sessaoId);
    if (existing) {
      logger.warn(`RegistroHoras já existe para sessão ${sessaoId}`);
      return existing;
    }

    // Calculate hours: (end - start) in hours
    const startTime = new Date(sessao.data_hora_inicio);
    const endTime = new Date(sessao.data_hora_fim);
    const horasRegistradas = (endTime - startTime) / (1000 * 60 * 60);

    // Validate hours calculation
    if (horasRegistradas <= 0) {
      logger.error(`Horas inválidas calculadas para sessão ${sessaoId}: ${horasRegistradas}h`);
      throw new AppError("Erro ao calcular horas da sessão", 500);
    }

    // Create registro
    const registro = await registroHorasRepository.create({
      tutor: tutor._id,
      sessao: sessaoId,
      programa: tutor.programa,
      horas_registradas: horasRegistradas,
      tipo: "tutoria",
      status: "pendente",
      disciplina: sessao.disciplina,
      data_sessao: sessao.data_hora_inicio,
    });

    logger.info(
      `RegistroHoras criado: ${registro._id} - ${horasRegistradas.toFixed(2)}h para tutor ${tutor.nome} (${tutor._id})`,
    );

    return registro;
  },

  /**
   * Get aggregate hours summary for a tutor in a program
   * Returns hours by status and progress towards required hours
   *
   * @param {string} tutorId - The tutor user ID
   * @param {string} programId - The program ID
   * @returns {Object} Summary with hours breakdown and progress
   */
  async getTutorHoursSummary(tutorId, programId) {
    const tutor = await userRepository.findById(tutorId);

    if (!tutor) {
      throw new AppError("Tutor não encontrado", 404);
    }

    // Get program with institution info
    const programa = await programaRepository.findByIdPopulated(programId);

    if (!programa) {
      throw new AppError("Programa não encontrado", 404);
    }

    // Determine required hours
    let horasObrigatorias = 0;

    if (programa.horas_aula_obrigatorias) {
      // Program has specific requirement
      horasObrigatorias = programa.horas_aula_obrigatorias;
    } else if (programa.instituicao.configuracoes) {
      // Use institution default based on academic level
      const config = programa.instituicao.configuracoes;
      if (tutor.nivel_academico === "mestrado") {
        horasObrigatorias = config.horas_mestrado || 60;
      } else if (tutor.nivel_academico === "doutorado") {
        horasObrigatorias = config.horas_doutorado || 120;
      }
    }

    // Get all registros for this tutor in this program
    const registros = await registroHorasRepository.findByTutorAndProgram(tutorId, programId);

    // Aggregate hours by status
    const pendentes = registros
      .filter((r) => r.status === "pendente")
      .reduce((sum, r) => sum + r.horas_registradas, 0);

    const aprovadas = registros
      .filter((r) => r.status === "aprovado")
      .reduce((sum, r) => sum + r.horas_registradas, 0);

    const rejeitadas = registros
      .filter((r) => r.status === "rejeitado")
      .reduce((sum, r) => sum + r.horas_registradas, 0);

    const saldo = aprovadas - horasObrigatorias;
    const percentualCumprido = horasObrigatorias > 0 ? (aprovadas / horasObrigatorias) * 100 : 0;

    return {
      tutor: {
        id: tutor._id,
        nome: tutor.nome,
        nivel_academico: tutor.nivel_academico,
      },
      programa: {
        id: programa._id,
        nome: programa.nome,
      },
      horas_obrigatorias: horasObrigatorias,
      horas_aprovadas: parseFloat(aprovadas.toFixed(2)),
      horas_pendentes: parseFloat(pendentes.toFixed(2)),
      horas_rejeitadas: parseFloat(rejeitadas.toFixed(2)),
      saldo: parseFloat(saldo.toFixed(2)),
      percentual_cumprido: parseFloat(percentualCumprido.toFixed(2)),
      total_registros: registros.length,
      meta_atingida: aprovadas >= horasObrigatorias,
    };
  },

  /**
   * Approve or reject hours
   *
   * @param {string} registroId - The RegistroHoras ID
   * @param {string} coordinatorId - The coordinator user ID
   * @param {boolean} approved - True to approve, false to reject
   * @param {string} observacao - Optional observation/comment
   * @returns {Object} The updated RegistroHoras
   */
  async approveHours(registroId, coordinatorId, approved, observacao = "") {
    const registro = await registroHorasRepository.findById(registroId);

    if (!registro) {
      throw new AppError("Registro de horas não encontrado", 404);
    }

    if (registro.status !== "pendente") {
      throw new AppError("Apenas registros pendentes podem ser aprovados ou rejeitados", 400);
    }

    // Prevent self-approval
    if (registro.tutor._id.toString() === coordinatorId) {
      throw new AppError("Você não pode aprovar suas próprias horas", 403);
    }

    const status = approved ? "aprovado" : "rejeitado";

    const updated = await registroHorasRepository.updateStatus(
      registroId,
      status,
      coordinatorId,
      observacao,
    );

    logger.info(
      `RegistroHoras ${registroId} ${status} por coordenador ${coordinatorId}. Horas: ${updated.horas_registradas}h`,
    );

    return updated;
  },

  /**
   * Bulk approve multiple hours registrations
   *
   * @param {Array<string>} registroIds - Array of RegistroHoras IDs
   * @param {string} coordinatorId - The coordinator user ID
   * @returns {Array} Array of results with success/failure per registro
   */
  async bulkApproveHours(registroIds, coordinatorId) {
    const results = [];

    for (const id of registroIds) {
      try {
        const result = await this.approveHours(id, coordinatorId, true);
        results.push({
          id,
          success: true,
          registro: result,
        });
      } catch (error) {
        results.push({
          id,
          success: false,
          error: error.message,
        });
        logger.error(`Erro ao aprovar registro ${id}: ${error.message}`);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    logger.info(
      `Aprovação em lote: ${successCount}/${registroIds.length} registros aprovados por ${coordinatorId}`,
    );

    return results;
  },

  /**
   * Get pending hours for a coordinator to review
   *
   * @param {string} coordinatorId - The coordinator user ID
   * @param {Object} filters - Optional filters (pagination, etc)
   * @returns {Object} Paginated list of pending registros
   */
  async getPendingHoursForCoordinator(coordinatorId, filters = {}) {
    const user = await userRepository.findById(coordinatorId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Get programs this user coordinates
    const programas = await programaRepository.findByCoordinator(coordinatorId);

    if (programas.length === 0) {
      return { data: [], total: 0 };
    }

    // Get pending registros for all coordinated programs
    const programIds = programas.map((p) => p._id);
    const allPending = [];

    for (const programId of programIds) {
      const pending = await registroHorasRepository.findByProgramWithFilters(programId, {
        status: "pendente",
        ...filters,
      });
      allPending.push(...pending.data);
    }

    // Sort by date (most recent first)
    allPending.sort((a, b) => b.data_sessao - a.data_sessao);

    return {
      data: allPending,
      total: allPending.length,
    };
  },
};

module.exports = hoursTrackingService;
