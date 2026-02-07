const sessaoRepository = require("../repositories/sessaoRepository");
const userRepository = require("../repositories/userRepository");
const googleCalendarService = require("./googleCalendarService");
const {
  notificarSessaoAgendada,
  notificarSessaoConfirmada,
  notificarSessaoCancelada,
  notificarSessaoConcluida,
  notificarAvaliacaoPendente,
} = require("../helpers/notificacaoHelper");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

const sessionService = {
  async createSession(userId, tutorId, disciplina, dataHoraInicio, dataHoraFim, observacoes) {
    if (!tutorId || !disciplina || !dataHoraInicio || !dataHoraFim) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    const user = await userRepository.findByIdFull(userId);
    const tutor = await userRepository.findByIdFull(tutorId);

    if (!tutor || !tutor.isTutor) {
      throw new AppError("Tutor não encontrado", 404);
    }

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (tutorId === userId) {
      throw new AppError("Você não pode agendar uma sessão consigo mesmo", 400);
    }

    const dataInicio = new Date(dataHoraInicio);
    const dataFim = new Date(dataHoraFim);

    if (dataInicio >= dataFim) {
      throw new AppError("A hora de término deve ser depois da hora de início", 400);
    }

    if (dataInicio < new Date()) {
      throw new AppError("Não é possível agendar sessões no passado", 400);
    }

    const conflito = await sessaoRepository.findConflicting(tutorId, dataInicio, dataFim);
    if (conflito) {
      throw new AppError("O tutor já tem uma sessão agendada neste horário", 400);
    }

    // Google Calendar
    let calendarData = {
      googleEventId: null,
      htmlLink: null,
      linkMeet: null,
      conferenceStatus: "pending",
    };

    if (tutor.googleAccessToken) {
      const event = {
        summary: `Tutoria: ${disciplina}`,
        description: `Sessão de tutoria com ${user.nome}\n\n${observacoes || ""}`,
        start: {
          dateTime: dataInicio.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: dataFim.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        attendees: [{ email: user.email }, { email: tutor.email }],
        conferenceData: {
          createRequest: {
            requestId: `tutorconnect-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

      const result = await googleCalendarService.createEvent(tutor, event);
      if (result) {
        calendarData = {
          googleEventId: result.googleEventId,
          htmlLink: result.htmlLink,
          linkMeet: result.linkMeet,
          conferenceStatus: result.conferenceStatus,
        };
      }
    }

    const sessao = await sessaoRepository.create({
      tutor: tutorId,
      aluno: userId,
      disciplina,
      data_hora_inicio: dataInicio,
      data_hora_fim: dataFim,
      observacoes,
      googleEventId: calendarData.googleEventId,
      htmlLink: calendarData.htmlLink,
      link_meet: calendarData.linkMeet,
      conferenceStatus: calendarData.conferenceStatus,
      status: "Pendente",
    });

    await Promise.all([
      userRepository.pushSessao(userId, sessao._id, false),
      userRepository.pushSessao(tutorId, sessao._id, true),
    ]);

    await notificarSessaoAgendada(sessao, user.nome);

    return sessaoRepository.findByIdPopulated(sessao._id);
  },

  async getUserSessions(userId, filters = {}) {
    return sessaoRepository.findByUser(userId, filters);
  },

  async getSessionById(id, userId) {
    const sessao = await sessaoRepository.findByIdPopulated(id);

    if (!sessao) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (
      sessao.tutor._id.toString() !== userId &&
      sessao.aluno._id.toString() !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    return sessao;
  },

  async confirmSession(id, userId) {
    const sessao = await sessaoRepository.findById(id);

    if (!sessao) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (sessao.tutor.toString() !== userId) {
      throw new AppError("Apenas o tutor pode confirmar a sessão", 403);
    }

    if (sessao.status !== "Pendente") {
      throw new AppError("Apenas sessões pendentes podem ser confirmadas", 400);
    }

    sessao.status = "Confirmada";
    await sessao.save();

    const tutor = await userRepository.findByIdFull(sessao.tutor);
    await notificarSessaoConfirmada(sessao, tutor.nome);

    return sessaoRepository.findByIdPopulated(sessao._id);
  },

  async completeSession(id, userId) {
    const sessao = await sessaoRepository.findById(id);

    if (!sessao) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (
      sessao.tutor.toString() !== userId &&
      sessao.aluno.toString() !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    if (sessao.status === "Cancelada") {
      throw new AppError("Sessão cancelada não pode ser concluída", 400);
    }

    sessao.status = "Concluída";
    await sessao.save();

    const tutor = await userRepository.findByIdFull(sessao.tutor);
    const aluno = await userRepository.findByIdFull(sessao.aluno);

    await Promise.all([
      notificarSessaoConcluida(sessao, sessao.tutor, aluno.nome),
      notificarSessaoConcluida(sessao, sessao.aluno, tutor.nome),
      notificarAvaliacaoPendente(sessao, tutor.nome),
    ]);

    return sessaoRepository.findByIdPopulated(sessao._id);
  },

  async cancelSession(id, userId, motivo) {
    const sessao = await sessaoRepository.findById(id);

    if (!sessao) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (
      sessao.tutor.toString() !== userId &&
      sessao.aluno.toString() !== userId
    ) {
      throw new AppError("Acesso negado", 403);
    }

    if (sessao.status === "Concluída") {
      throw new AppError("Sessão concluída não pode ser cancelada", 400);
    }

    if (sessao.status === "Cancelada") {
      throw new AppError("Sessão já está cancelada", 400);
    }

    sessao.status = "Cancelada";
    sessao.motivo_cancelamento = motivo || "";
    sessao.cancelado_por = userId;
    await sessao.save();

    // Google Calendar
    if (sessao.googleEventId) {
      const tutor = await userRepository.findByIdFull(sessao.tutor);
      await googleCalendarService.deleteEvent(tutor, sessao.googleEventId);
    }

    const quemCancelou = await userRepository.findByIdFull(userId);
    const destinatario =
      sessao.tutor.toString() === userId ? sessao.aluno : sessao.tutor;

    await notificarSessaoCancelada(sessao, userId, quemCancelou.nome, destinatario);

    return sessaoRepository.findByIdPopulated(sessao._id);
  },
};

module.exports = sessionService;
