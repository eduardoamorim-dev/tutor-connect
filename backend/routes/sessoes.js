const express = require('express');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Sessao = require('../models/Sessao');
const Avaliacao = require('../models/Avaliacao');
const router = express.Router();

require('dotenv').config();

// Middleware para verificar JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Criar sessão
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { tutorId, disciplina, data_hora_inicio, data_hora_fim } = req.body;
    const user = await User.findById(req.userId);
    const tutor = await User.findById(tutorId);
    if (!tutor || !user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: tutor.googleAccessToken, refresh_token: tutor.googleRefreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = {
      summary: `Tutoria: ${disciplina}`,
      start: { dateTime: new Date(data_hora_inicio).toISOString(), timeZone: 'America/Sao_Paulo' },
      end: { dateTime: new Date(data_hora_fim).toISOString(), timeZone: 'America/Sao_Paulo' },
      attendees: [{ email: user.email }, { email: tutor.email }],
      conferenceData: { createRequest: { requestId: `${Date.now()}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      resource: event,
      sendUpdates: 'all'
    });

    const sessao = new Sessao({
      tutor: tutorId,
      aluno: req.userId,
      disciplina,
      data_hora_inicio,
      data_hora_fim,
      googleEventId: response.data.id,
      htmlLink: response.data.htmlLink,
      link_meet: response.data.conferenceData?.entryPoints[0]?.uri,
      conferenceStatus: response.data.conferenceData ? 'success' : 'pending'
    });
    await sessao.save();

    user.sessoes_participadas.push(sessao._id);
    tutor.sessoes_participadas.push(sessao._id);
    await user.save();
    await tutor.save();

    res.json({ sessao });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar sessões do usuário
router.get('/minhas-sessoes', authMiddleware, async (req, res) => {
  try {
    const sessoes = await Sessao.find({ $or: [{ tutor: req.userId }, { aluno: req.userId }] })
      .populate('tutor', 'nome email')
      .populate('aluno', 'nome email');
    res.json(sessoes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Criar avaliação
router.post('/avaliar', authMiddleware, async (req, res) => {
  try {
    const { sessaoId, nota, comentario } = req.body;
    const sessao = await Sessao.findById(sessaoId);
    if (!sessao) return res.status(404).json({ error: 'Sessão não encontrada' });
    const avaliacao = new Avaliacao({ sessao: sessaoId, avaliador: req.userId, nota, comentario });
    await avaliacao.save();
    sessao.avaliacao_pendente = false;
    await sessao.save();
    res.json({ message: 'Avaliação enviada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;