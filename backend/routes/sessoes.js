const express = require("express");
const authMiddleware = require("../middleware/auth");
const sessionService = require("../services/sessionService");
const ratingService = require("../services/ratingService");
const { asyncHandler } = require("../middleware/errorHandler");
const router = express.Router();

/**
 * @swagger
 * /sessoes/create:
 *   post:
 *     summary: Criar nova sessão de tutoria
 *     tags: [Sessoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tutorId, disciplina, data_hora_inicio, data_hora_fim]
 *             properties:
 *               tutorId: { type: string }
 *               disciplina: { type: string }
 *               data_hora_inicio: { type: string, format: date-time }
 *               data_hora_fim: { type: string, format: date-time }
 *               observacoes: { type: string }
 *     responses:
 *       201: { description: Sessão criada }
 *       400: { description: Dados inválidos ou conflito de horário }
 */
router.post("/create", authMiddleware, asyncHandler(async (req, res) => {
  const { tutorId, disciplina, data_hora_inicio, data_hora_fim, observacoes } = req.body;
  const sessao = await sessionService.createSession(
    req.userId, tutorId, disciplina, data_hora_inicio, data_hora_fim, observacoes,
  );
  res.status(201).json({ sessao });
}));

/**
 * @swagger
 * /sessoes/minhas-sessoes:
 *   get:
 *     summary: Listar sessões do usuário logado
 *     tags: [Sessoes]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pendente, Confirmada, Concluída, Cancelada] }
 *       - in: query
 *         name: tipo
 *         schema: { type: string, enum: [tutor, aluno] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de sessões }
 */
router.get("/minhas-sessoes", authMiddleware, asyncHandler(async (req, res) => {
  const { status, tipo, page, limit } = req.query;
  const result = await sessionService.getUserSessions(req.userId, {
    status,
    tipo,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json(result.data);
}));

/**
 * @swagger
 * /sessoes/{id}:
 *   get:
 *     summary: Buscar sessão específica
 *     tags: [Sessoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detalhes da sessão }
 *       403: { description: Acesso negado }
 *       404: { description: Sessão não encontrada }
 */
router.get("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const sessao = await sessionService.getSessionById(req.params.id, req.userId);
  res.json(sessao);
}));

/**
 * @swagger
 * /sessoes/{id}/confirmar:
 *   put:
 *     summary: Confirmar sessão (apenas tutor)
 *     tags: [Sessoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Sessão confirmada }
 *       403: { description: Apenas o tutor pode confirmar }
 */
router.put("/:id/confirmar", authMiddleware, asyncHandler(async (req, res) => {
  const sessao = await sessionService.confirmSession(req.params.id, req.userId);
  res.json({ sessao });
}));

/**
 * @swagger
 * /sessoes/{id}/concluir:
 *   put:
 *     summary: Concluir sessão
 *     tags: [Sessoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Sessão concluída }
 */
router.put("/:id/concluir", authMiddleware, asyncHandler(async (req, res) => {
  const sessao = await sessionService.completeSession(req.params.id, req.userId);
  res.json({ sessao });
}));

/**
 * @swagger
 * /sessoes/{id}/cancelar:
 *   put:
 *     summary: Cancelar sessão
 *     tags: [Sessoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo: { type: string }
 *     responses:
 *       200: { description: Sessão cancelada }
 */
router.put("/:id/cancelar", authMiddleware, asyncHandler(async (req, res) => {
  const { motivo } = req.body;
  const sessao = await sessionService.cancelSession(req.params.id, req.userId, motivo);
  res.json({ sessao });
}));

/**
 * @swagger
 * /sessoes/avaliar:
 *   post:
 *     summary: Avaliar sessão concluída
 *     tags: [Sessoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessaoId, nota]
 *             properties:
 *               sessaoId: { type: string }
 *               nota: { type: integer, minimum: 1, maximum: 5 }
 *               comentario: { type: string }
 *     responses:
 *       200: { description: Avaliação enviada }
 *       403: { description: Apenas o aluno pode avaliar }
 */
router.post("/avaliar", authMiddleware, asyncHandler(async (req, res) => {
  const { sessaoId, nota, comentario } = req.body;
  const result = await ratingService.createRating(req.userId, sessaoId, nota, comentario);
  res.json(result);
}));

/**
 * @swagger
 * /sessoes/avaliacoes/tutor/{tutorId}:
 *   get:
 *     summary: Buscar avaliações de um tutor
 *     tags: [Sessoes]
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de avaliações }
 */
router.get("/avaliacoes/tutor/:tutorId", authMiddleware, asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await ratingService.getTutorRatings(req.params.tutorId, {
    page: page ? parseInt(page) : undefined,
    perPage: limit ? parseInt(limit) : undefined,
  });
  res.json(result.data);
}));

module.exports = router;
