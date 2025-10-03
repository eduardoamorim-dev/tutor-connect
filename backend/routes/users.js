const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

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

// Buscar tutores disponíveis
router.get('/tutores', authMiddleware, async (req, res) => {
  try {
    // Busca usuários que têm disciplinas que dominam (são tutores)
    const tutores = await User.find(
      { 
        'disciplinas_dominadas.0': { $exists: true },
        _id: { $ne: req.userId } // Exclui o próprio usuário
      },
      'nome email disciplinas_dominadas disponibilidade localizacao'
    );
    res.json(tutores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar perfil do usuário logado
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-senha -googleAccessToken -googleRefreshToken');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrada' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { 
      bio, 
      localizacao, 
      disciplinas_dominadas, 
      disciplinas_precisa, 
      disponibilidade 
    } = req.body;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (localizacao !== undefined) updateData.localizacao = localizacao;
    if (disciplinas_dominadas !== undefined) updateData.disciplinas_dominadas = disciplinas_dominadas;
    if (disciplinas_precisa !== undefined) updateData.disciplinas_precisa = disciplinas_precisa;
    if (disponibilidade !== undefined) updateData.disponibilidade = disponibilidade;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-senha -googleAccessToken -googleRefreshToken');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar alunos (usuários que precisam de ajuda)
router.get('/alunos', authMiddleware, async (req, res) => {
  try {
    const alunos = await User.find(
      { 
        'disciplinas_precisa.0': { $exists: true },
        _id: { $ne: req.userId }
      },
      'nome email disciplinas_precisa localizacao'
    );
    res.json(alunos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;