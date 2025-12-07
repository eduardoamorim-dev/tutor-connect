const express = require("express");
const jwt = require("jsonwebtoken");
const Notificacao = require("../models/Notificacao");
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

// Listar notificações do usuário
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { limit = 20, apenas_nao_lidas } = req.query;

    let query = { usuario: req.userId };

    if (apenas_nao_lidas === "true") {
      query.lida = false;
    }

    const notificacoes = await Notificacao.find(query)
      .populate("sessao", "disciplina data_hora_inicio tutor aluno")
      .sort({ data_criacao: -1 })
      .limit(parseInt(limit));

    res.json(notificacoes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Contar notificações não lidas
router.get("/count", authMiddleware, async (req, res) => {
  try {
    const count = await Notificacao.countDocuments({
      usuario: req.userId,
      lida: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Marcar notificação como lida
router.put("/:id/ler", authMiddleware, async (req, res) => {
  try {
    const notificacao = await Notificacao.findOne({
      _id: req.params.id,
      usuario: req.userId,
    });

    if (!notificacao) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }

    notificacao.lida = true;
    await notificacao.save();

    res.json({ message: "Notificação marcada como lida" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Marcar todas como lidas
router.put("/ler-todas", authMiddleware, async (req, res) => {
  try {
    await Notificacao.updateMany(
      { usuario: req.userId, lida: false },
      { lida: true }
    );

    res.json({ message: "Todas as notificações marcadas como lidas" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar notificação
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notificacao = await Notificacao.findOneAndDelete({
      _id: req.params.id,
      usuario: req.userId,
    });

    if (!notificacao) {
      return res.status(404).json({ error: "Notificação não encontrada" });
    }

    res.json({ message: "Notificação removida" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar todas as notificações lidas
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Notificacao.deleteMany({
      usuario: req.userId,
      lida: true,
    });

    res.json({ message: "Notificações lidas removidas" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
