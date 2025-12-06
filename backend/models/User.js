const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  bio: { type: String, maxlength: 500 },
  localizacao: { type: String },

  // Define se o usuário quer ser tutor
  isTutor: { type: Boolean, default: false },

  // Disciplinas que o usuário domina (só relevante se isTutor = true)
  disciplinas_dominadas: [
    {
      disciplina: { type: String, required: true },
      nivel: { type: String, enum: ["Básico", "Intermediário", "Avançado"] },
    },
  ],

  // Disciplinas que o usuário precisa de ajuda
  disciplinas_precisa: [
    {
      disciplina: { type: String, required: true },
      nivel_desejado: {
        type: String,
        enum: ["Básico", "Intermediário", "Avançado"],
      },
    },
  ],

  // Disponibilidade por data específica (só relevante se isTutor = true)
  disponibilidade: [
    {
      data: { type: Date, required: true },
      horario_inicio: { type: String, required: true },
      horario_fim: { type: String, required: true },
    },
  ],

  // Estatísticas do tutor
  rating: { type: Number, default: 0, min: 0, max: 5 },
  total_avaliacoes: { type: Number, default: 0 },
  total_sessoes: { type: Number, default: 0 },

  avaliacoes_recebidas: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Avaliacao" },
  ],
  sessoes_participadas: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Sessao" },
  ],

  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  googleTokenExpiry: { type: Date },

  profileCompleted: { type: Boolean, default: false },
  data_criacao: { type: Date, default: Date.now },
  googleId: { type: String, sparse: true, unique: true },
});

// Índices para buscas otimizadas
userSchema.index({ "disciplinas_dominadas.disciplina": 1 });
userSchema.index({ isTutor: 1 });
userSchema.index({ rating: -1 });

module.exports = mongoose.model("User", userSchema);
