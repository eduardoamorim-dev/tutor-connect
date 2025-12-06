const mongoose = require("mongoose");

const sessaoSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  disciplina: { type: String, required: true },
  data_hora_inicio: { type: Date, required: true },
  data_hora_fim: { type: Date, required: true },

  // Google Calendar
  googleEventId: { type: String },
  htmlLink: { type: String },
  link_meet: { type: String },
  conferenceStatus: { type: String, enum: ["pending", "success", "failure"] },

  // Status da sessão
  status: {
    type: String,
    enum: ["Pendente", "Confirmada", "Concluída", "Cancelada"],
    default: "Pendente",
  },

  // Motivo do cancelamento (se aplicável)
  motivo_cancelamento: { type: String },
  cancelado_por: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Avaliação
  avaliacao: { type: mongoose.Schema.Types.ObjectId, ref: "Avaliacao" },
  avaliacao_pendente: { type: Boolean, default: true },

  // Observações
  observacoes: { type: String, maxlength: 500 },

  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now },
});

// Atualiza data_atualizacao antes de salvar
sessaoSchema.pre("save", function (next) {
  this.data_atualizacao = new Date();
  next();
});

// Índices
sessaoSchema.index({ tutor: 1, data_hora_inicio: 1 });
sessaoSchema.index({ aluno: 1, data_hora_inicio: 1 });
sessaoSchema.index({ status: 1 });

module.exports = mongoose.model("Sessao", sessaoSchema);
