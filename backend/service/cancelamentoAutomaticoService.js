const Sessao = require("../models/Sessao");
const User = require("../models/User");
const { google } = require("googleapis");
const { notificarCancelamentoAutomatico } = require("../helpers/notificacaoHelper");

// Helper para criar cliente OAuth
const createOAuth2Client = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });
  return oauth2Client;
};

/**
 * Cancela automaticamente sessões pendentes que já passaram do prazo
 */
const cancelarSessoesPendentesExpiradas = async () => {
  try {
    const agora = new Date();
    
    console.log(`[${agora.toISOString()}] Verificando sessões pendentes expiradas...`);

    // Buscar todas as sessões pendentes que já passaram da data_hora_fim
    const sessoesExpiradas = await Sessao.find({
      status: "Pendente",
      data_hora_fim: { $lt: agora }, // Sessões com data_hora_fim menor que agora
    }).populate("tutor", "nome email googleAccessToken googleRefreshToken")
      .populate("aluno", "nome email");

    if (sessoesExpiradas.length === 0) {
      console.log("Nenhuma sessão pendente expirada encontrada.");
      return { canceladas: 0 };
    }

    console.log(`Encontradas ${sessoesExpiradas.length} sessões pendentes expiradas.`);

    let canceladasComSucesso = 0;
    let erros = 0;

    // Processar cada sessão expirada
    for (const sessao of sessoesExpiradas) {
      try {
        // Atualizar status da sessão
        sessao.status = "Cancelada";
        sessao.motivo_cancelamento = "Cancelada automaticamente pelo sistema por falta de confirmação do tutor";
        sessao.cancelado_por = null; // Sistema cancelou, não foi um usuário específico
        await sessao.save();

        // Tentar cancelar no Google Calendar
        if (sessao.googleEventId && sessao.tutor.googleAccessToken) {
          try {
            const oauth2Client = createOAuth2Client(sessao.tutor);
            const calendar = google.calendar({ version: "v3", auth: oauth2Client });
            
            await calendar.events.delete({
              calendarId: "primary",
              eventId: sessao.googleEventId,
              sendUpdates: "all",
            });
            
            console.log(`Evento do Google Calendar ${sessao.googleEventId} cancelado.`);
          } catch (calendarError) {
            console.error(
              `Erro ao cancelar evento ${sessao.googleEventId} no Calendar:`,
              calendarError.message
            );
            // Continua mesmo se falhar no Calendar
          }
        }

        // Notificar tutor
        await notificarCancelamentoAutomatico(
          sessao,
          sessao.tutor._id,
          "tutor",
          sessao.aluno.nome
        );

        // Notificar aluno
        await notificarCancelamentoAutomatico(
          sessao,
          sessao.aluno._id,
          "aluno",
          sessao.tutor.nome
        );

        console.log(
          `Sessão ${sessao._id} cancelada automaticamente (Disciplina: ${sessao.disciplina}, ` +
          `Tutor: ${sessao.tutor.nome}, Aluno: ${sessao.aluno.nome})`
        );

        canceladasComSucesso++;
      } catch (error) {
        console.error(`Erro ao cancelar sessão ${sessao._id}:`, error);
        erros++;
      }
    }

    console.log(
      `Processo concluído: ${canceladasComSucesso} sessões canceladas, ${erros} erros.`
    );

    return { canceladas: canceladasComSucesso, erros };
  } catch (error) {
    console.error("Erro no serviço de cancelamento automático:", error);
    throw error;
  }
};

module.exports = {
  cancelarSessoesPendentesExpiradas,
};