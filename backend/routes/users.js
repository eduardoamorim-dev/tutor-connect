const express = require("express");
const authMiddleware = require("../middleware/auth");
const userService = require("../services/userService");
const availabilityService = require("../services/availabilityService");
const { asyncHandler } = require("../middleware/errorHandler");
const router = express.Router();

/**
 * @swagger
 * /users/tutores:
 *   get:
 *     summary: Buscar tutores disponíveis
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: disciplina
 *         schema: { type: string }
 *         description: Filtrar por disciplina
 *       - in: query
 *         name: dia
 *         schema: { type: string }
 *         description: Filtrar por dia da semana
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de tutores }
 */
router.get("/tutores", authMiddleware, asyncHandler(async (req, res) => {
  const { disciplina, dia, page, limit } = req.query;
  const result = await userService.getTutors({
    disciplina,
    dia,
    excludeUserId: req.userId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json(result.data);
}));

/**
 * @swagger
 * /users/tutor/{id}:
 *   get:
 *     summary: Buscar perfil de um tutor com avaliações
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Perfil do tutor com avaliações }
 *       404: { description: Tutor não encontrado }
 */
router.get("/tutor/:id", authMiddleware, asyncHandler(async (req, res) => {
  const result = await userService.getTutorProfile(req.params.id);
  res.json(result);
}));

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Buscar perfil do usuário logado
 *     tags: [Users]
 *     responses:
 *       200: { description: Perfil do usuário }
 */
router.get("/profile", authMiddleware, asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.userId);
  res.json(user);
}));

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio: { type: string }
 *               localizacao: { type: string }
 *               isTutor: { type: boolean }
 *               disciplinas_dominadas: { type: array }
 *               disciplinas_precisa: { type: array }
 *     responses:
 *       200: { description: Perfil atualizado }
 */
router.put("/profile", authMiddleware, asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.userId, req.body);
  res.json(user);
}));

/**
 * @swagger
 * /users/disponibilidade:
 *   post:
 *     summary: Adicionar disponibilidade (tutores)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data, horario_inicio, horario_fim]
 *             properties:
 *               data: { type: string, format: date, example: "2026-03-15" }
 *               horario_inicio: { type: string, example: "14:00" }
 *               horario_fim: { type: string, example: "16:00" }
 *     responses:
 *       200: { description: Disponibilidade adicionada }
 *       400: { description: Conflito ou dados inválidos }
 */
router.post("/disponibilidade", authMiddleware, asyncHandler(async (req, res) => {
  const { data, horario_inicio, horario_fim } = req.body;
  const result = await availabilityService.addSlot(req.userId, data, horario_inicio, horario_fim);
  res.json(result);
}));

/**
 * @swagger
 * /users/tutor/{id}/disponibilidade:
 *   get:
 *     summary: Buscar disponibilidade de um tutor
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista de slots com status de agendamento }
 */
router.get("/tutor/:id/disponibilidade", authMiddleware, asyncHandler(async (req, res) => {
  const disponibilidades = await availabilityService.getAvailableSlots(req.params.id);
  res.json(disponibilidades);
}));

/**
 * @swagger
 * /users/disponibilidade/{id}:
 *   delete:
 *     summary: Remover disponibilidade
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Disponibilidade removida }
 *       400: { description: Sessão agendada neste horário }
 */
router.delete("/disponibilidade/:id", authMiddleware, asyncHandler(async (req, res) => {
  const result = await availabilityService.removeSlot(req.userId, req.params.id);
  res.json(result);
}));

/**
 * @swagger
 * /users/contagem:
 *   get:
 *     summary: Contagem de alunos e tutores
 *     tags: [Users]
 *     security: []
 *     responses:
 *       200:
 *         description: Contagem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTutores: { type: integer }
 *                 totalAlunos: { type: integer }
 */
router.get("/contagem", asyncHandler(async (req, res) => {
  const counts = await userService.getUserCount();
  res.json(counts);
}));

module.exports = router;
