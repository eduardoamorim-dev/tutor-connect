const express = require("express");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Sessao = require("../models/Sessao");
const Avaliacao = require("../models/Avaliacao");
const router = express.Router();

require("dotenv").config();

// Middleware para verificar JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

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

// Verificar conflito de horário
const verificarConflito = async (
  tutorId,
  dataInicio,
  dataFim,
  sessaoIdExcluir = null,
) => {
  const query = {
    tutor: tutorId,
    status: { $in: ["Pendente", "Confirmada"] },
    $or: [
      {
        data_hora_inicio: { $lt: dataFim },
        data_hora_fim: { $gt: dataInicio },
      },
    ],
  };

  if (sessaoIdExcluir) {
    query._id = { $ne: sessaoIdExcluir };
  }

  const conflito = await Sessao.findOne(query);
  return conflito !== null;
};

// Criar sessão
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      tutorId,
      disciplina,
      data_hora_inicio,
      data_hora_fim,
      observacoes,
    } = req.body;

    // Validações básicas
    if (!tutorId || !disciplina || !data_hora_inicio || !data_hora_fim) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }

    const user = await User.findById(req.userId);
    const tutor = await User.findById(tutorId);

    if (!tutor || !tutor.isTutor) {
      return res.status(404).json({ error: "Tutor não encontrado" });
    }

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (tutorId === req.userId) {
      return res
        .status(400)
        .json({ error: "Você não pode agendar uma sessão consigo mesmo" });
    }

    const dataInicio = new Date(data_hora_inicio);
    const dataFim = new Date(data_hora_fim);

    // Validar datas
    if (dataInicio >= dataFim) {
      return res
        .status(400)
        .json({ error: "A hora de término deve ser depois da hora de início" });
    }

    if (dataInicio < new Date()) {
      return res
        .status(400)
        .json({ error: "Não é possível agendar sessões no passado" });
    }

    // Verificar conflito de horário
    const temConflito = await verificarConflito(tutorId, dataInicio, dataFim);
    if (temConflito) {
      return res
        .status(400)
        .json({ error: "O tutor já tem uma sessão agendada neste horário" });
    }

    // Criar evento no Google Calendar
    let googleEventId = null;
    let htmlLink = null;
    let linkMeet = null;
    let conferenceStatus = "pending";

    if (tutor.googleAccessToken) {
      try {
        const oauth2Client = createOAuth2Client(tutor);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

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

        const response = await calendar.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          resource: event,
          sendUpdates: "all",
        });

        googleEventId = response.data.id;
        htmlLink = response.data.htmlLink;
        linkMeet = response.data.conferenceData?.entryPoints?.[0]?.uri;
        conferenceStatus = linkMeet ? "success" : "failure";
      } catch (calendarError) {
        console.error(
          "Erro ao criar evento no Calendar:",
          calendarError.message,
        );
        // Continua sem o evento do calendar
      }
    }

    // Criar sessão
    const sessao = new Sessao({
      tutor: tutorId,
      aluno: req.userId,
      disciplina,
      data_hora_inicio: dataInicio,
      data_hora_fim: dataFim,
      observacoes,
      googleEventId,
      htmlLink,
      link_meet: linkMeet,
      conferenceStatus,
      status: "Pendente",
    });

    await sessao.save();

    // Atualizar referências nos usuários
    await User.findByIdAndUpdate(req.userId, {
      $push: { sessoes_participadas: sessao._id },
    });
    await User.findByIdAndUpdate(tutorId, {
      $push: { sessoes_participadas: sessao._id },
      $inc: { total_sessoes: 1 },
    });

    // Populate para retornar dados completos
    const sessaoPopulada = await Sessao.findById(sessao._id)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email");

    res.status(201).json({ sessao: sessaoPopulada });
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    res.status(400).json({ error: error.message });
  }
});

// Listar sessões do usuário
router.get("/minhas-sessoes", authMiddleware, async (req, res) => {
  try {
    const { status, tipo } = req.query;

    let query = {
      $or: [{ tutor: req.userId }, { aluno: req.userId }],
    };

    if (status) {
      query.status = status;
    }

    if (tipo === "tutor") {
      query = { tutor: req.userId };
      if (status) query.status = status;
    } else if (tipo === "aluno") {
      query = { aluno: req.userId };
      if (status) query.status = status;
    }

    const sessoes = await Sessao.find(query)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email")
      .populate("avaliacao")
      .sort({ data_hora_inicio: -1 });

    res.json(sessoes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar sessão específica
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const sessao = await Sessao.findById(req.params.id)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email")
      .populate("avaliacao");

    if (!sessao) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    // Verificar se o usuário faz parte da sessão
    if (
      sessao.tutor._id.toString() !== req.userId &&
      sessao.aluno._id.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    res.json(sessao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Confirmar sessão (tutor)
router.put("/:id/confirmar", authMiddleware, async (req, res) => {
  try {
    const sessao = await Sessao.findById(req.params.id);

    if (!sessao) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    if (sessao.tutor.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "Apenas o tutor pode confirmar a sessão" });
    }

    if (sessao.status !== "Pendente") {
      return res
        .status(400)
        .json({ error: "Apenas sessões pendentes podem ser confirmadas" });
    }

    sessao.status = "Confirmada";
    await sessao.save();

    const sessaoPopulada = await Sessao.findById(sessao._id)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email");

    res.json({ sessao: sessaoPopulada });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Concluir sessão
router.put("/:id/concluir", authMiddleware, async (req, res) => {
  try {
    const sessao = await Sessao.findById(req.params.id);

    if (!sessao) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    // Verificar se o usuário faz parte da sessão
    if (
      sessao.tutor.toString() !== req.userId &&
      sessao.aluno.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (sessao.status === "Cancelada") {
      return res
        .status(400)
        .json({ error: "Sessão cancelada não pode ser concluída" });
    }

    sessao.status = "Concluída";
    await sessao.save();

    const sessaoPopulada = await Sessao.findById(sessao._id)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email");

    res.json({ sessao: sessaoPopulada });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancelar sessão
router.put("/:id/cancelar", authMiddleware, async (req, res) => {
  try {
    const { motivo } = req.body;
    const sessao = await Sessao.findById(req.params.id);

    if (!sessao) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    // Verificar se o usuário faz parte da sessão
    if (
      sessao.tutor.toString() !== req.userId &&
      sessao.aluno.toString() !== req.userId
    ) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    if (sessao.status === "Concluída") {
      return res
        .status(400)
        .json({ error: "Sessão concluída não pode ser cancelada" });
    }

    if (sessao.status === "Cancelada") {
      return res.status(400).json({ error: "Sessão já está cancelada" });
    }

    sessao.status = "Cancelada";
    sessao.motivo_cancelamento = motivo || "";
    sessao.cancelado_por = req.userId;
    await sessao.save();

    // Tentar cancelar no Google Calendar
    if (sessao.googleEventId) {
      try {
        const tutor = await User.findById(sessao.tutor);
        if (tutor.googleAccessToken) {
          const oauth2Client = createOAuth2Client(tutor);
          const calendar = google.calendar({
            version: "v3",
            auth: oauth2Client,
          });
          await calendar.events.delete({
            calendarId: "primary",
            eventId: sessao.googleEventId,
            sendUpdates: "all",
          });
        }
      } catch (calendarError) {
        console.error(
          "Erro ao cancelar evento no Calendar:",
          calendarError.message,
        );
      }
    }

    const sessaoPopulada = await Sessao.findById(sessao._id)
      .populate("tutor", "nome email")
      .populate("aluno", "nome email");

    res.json({ sessao: sessaoPopulada });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Criar avaliação
router.post("/avaliar", authMiddleware, async (req, res) => {
  try {
    const { sessaoId, nota, comentario } = req.body;

    if (!sessaoId || !nota) {
      return res.status(400).json({ error: "Sessão e nota são obrigatórios" });
    }

    if (nota < 1 || nota > 5) {
      return res.status(400).json({ error: "Nota deve ser entre 1 e 5" });
    }

    const sessao = await Sessao.findById(sessaoId);

    if (!sessao) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    // Apenas o aluno pode avaliar
    if (sessao.aluno.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "Apenas o aluno pode avaliar a sessão" });
    }

    if (sessao.status !== "Concluída") {
      return res
        .status(400)
        .json({ error: "Apenas sessões concluídas podem ser avaliadas" });
    }

    if (!sessao.avaliacao_pendente) {
      return res.status(400).json({ error: "Esta sessão já foi avaliada" });
    }

    // Criar avaliação
    const avaliacao = new Avaliacao({
      sessao: sessaoId,
      tutor: sessao.tutor,
      aluno: req.userId,
      nota,
      comentario,
    });
    await avaliacao.save();

    // Atualizar sessão
    sessao.avaliacao = avaliacao._id;
    sessao.avaliacao_pendente = false;
    await sessao.save();

    // Atualizar rating do tutor
    const tutor = await User.findById(sessao.tutor);
    const todasAvaliacoes = await Avaliacao.find({ tutor: sessao.tutor });
    const mediaNotas =
      todasAvaliacoes.reduce((acc, av) => acc + av.nota, 0) /
      todasAvaliacoes.length;

    tutor.rating = Math.round(mediaNotas * 10) / 10;
    tutor.total_avaliacoes = todasAvaliacoes.length;
    tutor.avaliacoes_recebidas.push(avaliacao._id);
    await tutor.save();

    res.json({ message: "Avaliação enviada com sucesso", avaliacao });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar avaliações de um tutor
router.get("/avaliacoes/tutor/:tutorId", authMiddleware, async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.find({ tutor: req.params.tutorId })
      .populate("aluno", "nome")
      .populate("sessao", "disciplina data_hora_inicio")
      .sort({ data: -1 });

    res.json(avaliacoes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
