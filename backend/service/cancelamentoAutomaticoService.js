const Sessao = require("../models/Sessao");
const googleCalendarService = require("../services/googleCalendarService");
const { notificarCancelamentoAutomatico } = require("../helpers/notificacaoHelper");
const logger = require("../config/logger");

/**
 * Cancela automaticamente sessões pendentes que já passaram do prazo
 */
const cancelarSessoesPendentesExpiradas = async () => {
  try {
    const agora = new Date();

    logger.info(`Verificando sessões pendentes expiradas...`);

    const sessoesExpiradas = await Sessao.find({
      status: "Pendente",
      data_hora_fim: { $lt: agora },
    }).populate("tutor", "nome email googleAccessToken googleRefreshToken googleTokenExpiry")
      .populate("aluno", "nome email");

    if (sessoesExpiradas.length === 0) {
      logger.debug("Nenhuma sessão pendente expirada encontrada.");
      return { canceladas: 0 };
    }

    logger.info(`Encontradas ${sessoesExpiradas.length} sessões pendentes expiradas.`);

    let canceladasComSucesso = 0;
    let erros = 0;

    for (const sessao of sessoesExpiradas) {
      try {
        sessao.status = "Cancelada";
        sessao.motivo_cancelamento = "Cancelada automaticamente pelo sistema por falta de confirmação do tutor";
        sessao.cancelado_por = null;
        await sessao.save();

        if (sessao.googleEventId && sessao.tutor.googleAccessToken) {
          await googleCalendarService.deleteEvent(sessao.tutor, sessao.googleEventId);
        }

        await notificarCancelamentoAutomatico(
          sessao,
          sessao.tutor._id,
          "tutor",
          sessao.aluno.nome,
        );

        await notificarCancelamentoAutomatico(
          sessao,
          sessao.aluno._id,
          "aluno",
          sessao.tutor.nome,
        );

        logger.info(
          `Sessão ${sessao._id} cancelada automaticamente (Disciplina: ${sessao.disciplina}, ` +
          `Tutor: ${sessao.tutor.nome}, Aluno: ${sessao.aluno.nome})`,
        );

        canceladasComSucesso++;
      } catch (error) {
        logger.error(`Erro ao cancelar sessão ${sessao._id}:`, { error: error.message });
        erros++;
      }
    }

    logger.info(`Processo concluído: ${canceladasComSucesso} sessões canceladas, ${erros} erros.`);

    return { canceladas: canceladasComSucesso, erros };
  } catch (error) {
    logger.error("Erro no serviço de cancelamento automático:", { error: error.message });
    throw error;
  }
};

module.exports = {
  cancelarSessoesPendentesExpiradas,
};
