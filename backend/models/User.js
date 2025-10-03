const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  bio: { type: String, maxlength: 500 },
  localizacao: { type: String },
  disciplinas_dominadas: [{
    disciplina: { type: String, required: true },
    nivel: { type: String, enum: ['Básico', 'Intermediário', 'Avançado'] }
  }],
  disciplinas_precisa: [{
    disciplina: { type: String, required: true },
    nivel_desejado: { type: String, enum: ['Básico', 'Intermediário', 'Avançado'] }
  }],
  disponibilidade: [{
    dia: { type: String, enum: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] },
    horario_inicio: String,
    horario_fim: String
  }],
  avaliacoes_recebidas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Avaliacao' }],
  sessoes_participadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sessao' }],
  googleAccessToken: { type: String }, // Para Google API
  googleRefreshToken: { type: String },
  data_criacao: { type: Date, default: Date.now },
  googleId: { type: String, sparse: true, unique: true } // Para identificar usuários do Google
});

userSchema.index({ 'disciplinas_dominadas.disciplina': 1 });

module.exports = mongoose.model('User', userSchema);