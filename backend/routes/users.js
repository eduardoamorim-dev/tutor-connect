const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Avaliacao = require('../models/Avaliacao');
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

// Buscar tutores disponíveis (apenas usuários que são tutores)
router.get('/tutores', authMiddleware, async (req, res) => {
  try {
    const { disciplina, dia } = req.query;
    
    let query = {
      isTutor: true,
      profileCompleted: true,
      _id: { $ne: req.userId }
    };
    
    // Filtro por disciplina
    if (disciplina) {
      query['disciplinas_dominadas.disciplina'] = { $regex: disciplina, $options: 'i' };
    }
    
    // Filtro por dia da semana
    if (dia) {
      query['disponibilidade.dia'] = dia;
    }
    
    const tutores = await User.find(
      query,
      'nome email bio disciplinas_dominadas disponibilidade localizacao rating total_avaliacoes total_sessoes'
    ).sort({ rating: -1, total_sessoes: -1 });
    
    res.json(tutores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar perfil de um tutor específico com avaliações
router.get('/tutor/:id', authMiddleware, async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id)
      .select('-senha -googleAccessToken -googleRefreshToken');
    
    if (!tutor || !tutor.isTutor) {
      return res.status(404).json({ error: 'Tutor não encontrado' });
    }
    
    // Buscar últimas avaliações
    const avaliacoes = await Avaliacao.find({ tutor: tutor._id })
      .populate('aluno', 'nome')
      .sort({ data: -1 })
      .limit(10);
    
    res.json({ tutor, avaliacoes });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Buscar perfil do usuário logado
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-senha -googleAccessToken -googleRefreshToken');
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
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
      isTutor,
      disciplinas_dominadas, 
      disciplinas_precisa, 
      disponibilidade 
    } = req.body;
    
    const updateData = { profileCompleted: true };
    
    if (bio !== undefined) updateData.bio = bio;
    if (localizacao !== undefined) updateData.localizacao = localizacao;
    if (isTutor !== undefined) updateData.isTutor = isTutor;
    if (disciplinas_dominadas !== undefined) updateData.disciplinas_dominadas = disciplinas_dominadas;
    if (disciplinas_precisa !== undefined) updateData.disciplinas_precisa = disciplinas_precisa;
    if (disponibilidade !== undefined) updateData.disponibilidade = disponibilidade;
    
    // Se não é tutor, limpar dados de tutor
    if (isTutor === false) {
      updateData.disciplinas_dominadas = [];
      updateData.disponibilidade = [];
    }
    
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

// Adicionar disponibilidade
router.post('/disponibilidade', authMiddleware, async (req, res) => {
  try {
    const { data, horario_inicio, horario_fim } = req.body;
    
    if (!data || !horario_inicio || !horario_fim) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user || !user.isTutor) {
      return res.status(400).json({ error: 'Apenas tutores podem adicionar disponibilidade' });
    }
    
    // Criar data com horário de início para validação completa
    const [horaInicio, minutoInicio] = horario_inicio.split(':').map(Number);
    const [horaFim, minutoFim] = horario_fim.split(':').map(Number);
    
    // Criar objeto de data/hora completo para o início
    const dataHoraInicio = new Date(data + 'T' + horario_inicio + ':00');
    const dataHoraFim = new Date(data + 'T' + horario_fim + ':00');
    const agora = new Date();
    
    // Verificar se a data/hora de início já passou
    if (dataHoraInicio <= agora) {
      return res.status(400).json({ error: 'Não é possível adicionar disponibilidade para data/hora que já passou' });
    }
    
    // Verificar se horário de fim é depois do início
    if (dataHoraFim <= dataHoraInicio) {
      return res.status(400).json({ error: 'O horário de fim deve ser depois do horário de início' });
    }
    
    // Verificar se já existe disponibilidade conflitante
    const conflito = user.disponibilidade.some(d => {
      const dataExistente = new Date(d.data).toISOString().split('T')[0];
      const dataInput = new Date(data + 'T12:00:00').toISOString().split('T')[0];
      
      if (dataExistente !== dataInput) return false;
      
      const [hIniExist] = d.horario_inicio.split(':').map(Number);
      const [hFimExist] = d.horario_fim.split(':').map(Number);
      
      // Verifica sobreposição de horários
      return (horaInicio < hFimExist && horaFim > hIniExist);
    });
    
    if (conflito) {
      return res.status(400).json({ error: 'Já existe uma disponibilidade neste horário' });
    }
    
    // Adicionar nova disponibilidade
    user.disponibilidade.push({
      data: new Date(data + 'T12:00:00'),
      horario_inicio,
      horario_fim
    });
    
    await user.save();
    
    res.json({ 
      message: 'Disponibilidade adicionada',
      disponibilidade: user.disponibilidade 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/tutor/:id/disponibilidade', authMiddleware, async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id);
    
    if (!tutor || !tutor.isTutor) {
      return res.status(404).json({ error: 'Tutor não encontrado' });
    }
    
    // Filtrar apenas disponibilidades futuras (a partir de hoje)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const disponibilidadesFuturas = tutor.disponibilidade.filter(d => {
      const dataDisp = new Date(d.data);
      dataDisp.setHours(0, 0, 0, 0);
      return dataDisp >= hoje;
    });
    
    // Ordenar por data
    disponibilidadesFuturas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    // Buscar sessões já agendadas para essas datas
    const Sessao = require('../models/Sessao');
    const sessoesAgendadas = await Sessao.find({
      tutor: req.params.id,
      data_hora_inicio: { $gte: hoje },
      status: { $in: ['Pendente', 'Confirmada'] }
    }).select('data_hora_inicio data_hora_fim');
    
    // Marcar slots já agendados
    const disponibilidadesComStatus = disponibilidadesFuturas.map(d => {
      const dataDisp = new Date(d.data);
      const jaAgendado = sessoesAgendadas.some(s => {
        const dataSessao = new Date(s.data_hora_inicio);
        return dataSessao.toDateString() === dataDisp.toDateString() &&
          s.data_hora_inicio.getHours() === parseInt(d.horario_inicio.split(':')[0]);
      });
      return { ...d.toObject(), jaAgendado };
    });
    
    res.json(disponibilidadesComStatus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;