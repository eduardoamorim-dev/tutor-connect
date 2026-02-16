const express = require("express");
const authMiddleware = require("../middleware/auth");
const userService = require("../services/userService");
const availabilityService = require("../services/availabilityService");
const { asyncHandler } = require("../middleware/errorHandler");
const { validate } = require("../middleware/validate");
const { profileUpdateSchema, disponibilidadeSchema } = require("../config/schemas");
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
router.get(
  "/tutores",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { disciplina, dia, page, limit } = req.query;
    const result = await userService.getTutors({
      disciplina,
      dia,
      excludeUserId: req.userId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json(result.data);
  }),
);

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
router.get(
  "/tutor/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await userService.getTutorProfile(req.params.id);
    res.json(result);
  }),
);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Buscar perfil do usuário logado
 *     tags: [Users]
 *     responses:
 *       200: { description: Perfil do usuário }
 */
router.get(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.userId);
    res.json(user);
  }),
);

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
router.put(
  "/profile",
  authMiddleware,
  validate(profileUpdateSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json(user);
  }),
);

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
router.post(
  "/disponibilidade",
  authMiddleware,
  validate(disponibilidadeSchema),
  asyncHandler(async (req, res) => {
    const { data, horario_inicio, horario_fim } = req.body;
    const result = await availabilityService.addSlot(req.userId, data, horario_inicio, horario_fim);
    res.json(result);
  }),
);

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
router.get(
  "/tutor/:id/disponibilidade",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const disponibilidades = await availabilityService.getAvailableSlots(req.params.id);
    res.json(disponibilidades);
  }),
);

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
router.delete(
  "/disponibilidade/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await availabilityService.removeSlot(req.userId, req.params.id);
    res.json(result);
  }),
);

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
router.get(
  "/contagem",
  asyncHandler(async (req, res) => {
    const counts = await userService.getUserCount();
    res.json(counts);
  }),
);

/**
 * @swagger
 * /users/perfil-academico:
 *   patch:
 *     summary: Atualizar perfil acadêmico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nivel_academico: { type: string, enum: [graduacao, mestrado, doutorado, pos-doutorado] }
 *               instituicaoId: { type: string }
 *               programaId: { type: string }
 *               lattes_url: { type: string }
 *               orcid: { type: string }
 *               linha_pesquisa: { type: string }
 *               area_concentracao: { type: string }
 *     responses:
 *       200: { description: Perfil acadêmico atualizado }
 */
router.patch(
  "/perfil-academico",
  authMiddleware,
  validate(require("../config/schemas").updateAcademicProfileSchema),
  asyncHandler(async (req, res) => {
    const {
      nivel_academico,
      instituicaoId,
      programaId,
      lattes_url,
      orcid,
      linha_pesquisa,
      area_concentracao,
    } = req.body;

    const user = await userService.updateAcademicProfile(req.userId, {
      nivel_academico,
      instituicao: instituicaoId,
      programa: programaId,
      lattes_url,
      orcid,
      linha_pesquisa,
      area_concentracao,
    });
    res.json({ user });
  }),
);

/**
 * @swagger
 * /users/search-by-email:
 *   get:
 *     summary: Buscar usuário por email (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Usuário encontrado }
 *       404: { description: Usuário não encontrado }
 */
router.get(
  "/search-by-email",
  authMiddleware,
  require("../middleware/authorize").authorize("UPDATE_USER_ROLE"),
  asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }
    const user = await require("../models/User").findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Atualizar role do usuário (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [student, tutor, coordinator, admin] }
 *     responses:
 *       200: { description: Role atualizado }
 *       403: { description: Acesso negado }
 */
router.patch(
  "/:id/role",
  authMiddleware,
  require("../middleware/authorize").authorize("UPDATE_USER_ROLE"),
  validate(require("../config/schemas").updateRoleSchema),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await userService.updateUserRole(req.params.id, role);
    res.json({ user });
  }),
);

module.exports = router;
