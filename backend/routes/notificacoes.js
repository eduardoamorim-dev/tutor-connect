const express = require("express");
const authMiddleware = require("../middleware/auth");
const notificationService = require("../services/notificationService");
const { asyncHandler } = require("../middleware/errorHandler");
const router = express.Router();

/**
 * @swagger
 * /notificacoes:
 *   get:
 *     summary: Listar notificações do usuário
 *     tags: [Notificacoes]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: apenas_nao_lidas
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200: { description: Lista de notificações }
 */
router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 20, apenas_nao_lidas } = req.query;
  const result = await notificationService.list(req.userId, {
    limit: parseInt(limit),
    apenasNaoLidas: apenas_nao_lidas === "true",
  });
  res.json(result.data);
}));

/**
 * @swagger
 * /notificacoes/count:
 *   get:
 *     summary: Contar notificações não lidas
 *     tags: [Notificacoes]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer }
 */
router.get("/count", authMiddleware, asyncHandler(async (req, res) => {
  const result = await notificationService.countUnread(req.userId);
  res.json(result);
}));

/**
 * @swagger
 * /notificacoes/{id}/ler:
 *   put:
 *     summary: Marcar notificação como lida
 *     tags: [Notificacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notificação marcada como lida }
 *       404: { description: Notificação não encontrada }
 */
router.put("/:id/ler", authMiddleware, asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id, req.userId);
  res.json(result);
}));

/**
 * @swagger
 * /notificacoes/ler-todas:
 *   put:
 *     summary: Marcar todas as notificações como lidas
 *     tags: [Notificacoes]
 *     responses:
 *       200: { description: Todas marcadas como lidas }
 */
router.put("/ler-todas", authMiddleware, asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.userId);
  res.json(result);
}));

/**
 * @swagger
 * /notificacoes/{id}:
 *   delete:
 *     summary: Deletar notificação
 *     tags: [Notificacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Notificação removida }
 *       404: { description: Notificação não encontrada }
 */
router.delete("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const result = await notificationService.deleteById(req.params.id, req.userId);
  res.json(result);
}));

/**
 * @swagger
 * /notificacoes:
 *   delete:
 *     summary: Deletar todas as notificações lidas
 *     tags: [Notificacoes]
 *     responses:
 *       200: { description: Notificações lidas removidas }
 */
router.delete("/", authMiddleware, asyncHandler(async (req, res) => {
  const result = await notificationService.deleteAllRead(req.userId);
  res.json(result);
}));

module.exports = router;
