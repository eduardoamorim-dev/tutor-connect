const mongoose = require('mongoose');

const sessaoSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disciplina: { type: String, required: true },
  data_hora_inicio: { type: Date, required: true },
  data_hora_fim: { type: Date, required: true },
  googleEventId: { type: String, unique: true },
  htmlLink: { type: String },
  link_meet: { type: String },
  conferenceStatus: { type: String, enum: ['pending', 'success', 'failure'] },
  attendeesNotified: { type: Boolean, default: false },
  status: { type: String, enum: ['Pendente', 'Confirmada', 'Concluída', 'Cancelada'], default: 'Pendente' },
  avaliacao_pendente: { type: Boolean, default: true },
  data_criacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sessao', sessaoSchema);