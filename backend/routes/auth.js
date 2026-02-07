const express = require("express");
const authService = require("../services/authService");
const { asyncHandler } = require("../middleware/errorHandler");
const logger = require("../config/logger");
const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       201: { description: Usuário criado com sucesso }
 *       400: { description: Dados inválidos ou email já cadastrado }
 */
router.post("/register", asyncHandler(async (req, res) => {
  const { nome, email, senha } = req.body;
  const result = await authService.register(nome, email, senha);
  res.status(201).json(result);
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login com email e senha
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       200: { description: Login bem-sucedido, retorna token JWT }
 *       401: { description: Credenciais inválidas }
 */
router.post("/login", asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  const result = await authService.login(email, senha);
  res.json(result);
}));

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Iniciar login com Google OAuth
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302: { description: Redireciona para tela de login do Google }
 */
router.get("/google", asyncHandler(async (req, res) => {
  const url = authService.getGoogleAuthUrl();
  res.redirect(url);
}));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback do Google OAuth
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *     responses:
 *       302: { description: Redireciona para o frontend com token }
 */
router.get("/google/callback", asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${FRONTEND_URL}/login?error=${error}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    const { jwtToken, redirectPath } = await authService.googleCallback(code);
    res.redirect(`${FRONTEND_URL}${redirectPath}?token=${jwtToken}`);
  } catch (err) {
    logger.error("Erro no callback OAuth:", { error: err.message });
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
}));

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar validade do token JWT
 *     tags: [Auth]
 *     responses:
 *       200: { description: Token válido, retorna dados do usuário }
 *       401: { description: Token inválido }
 */
router.get("/verify", asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const result = await authService.verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ valid: false });
  }

  res.json(result);
}));

module.exports = router;
