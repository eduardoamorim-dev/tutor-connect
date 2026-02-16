const mongoose = require("mongoose");

const registroHorasSchema = new mongoose.Schema({
  // Always the tutor (person teaching/providing hours)
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Tutor é obrigatório"],
  },

  // Reference to session (automatic creation on session completion)
  sessao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sessao",
    required: [true, "Sessão é obrigatória"],
  },

  // Program where hours count
  programa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Programa",
    required: [true, "Programa é obrigatório"],
  },

  // Calculated from session: (data_hora_fim - data_hora_inicio) in hours
  horas_registradas: {
    type: Number,
    required: [true, "Horas registradas é obrigatório"],
    min: [0, "Horas registradas não pode ser negativo"],
  },

  // Type of activity
  tipo: {
    type: String,
    enum: {
      values: ["tutoria", "monitoria", "estagio_docencia", "outro"],
      message: "Tipo deve ser: tutoria, monitoria, estagio_docencia ou outro",
    },
    default: "tutoria",
  },

  // Approval workflow
  status: {
    type: String,
    enum: {
      values: ["pendente", "aprovado", "rejeitado"],
      message: "Status deve ser: pendente, aprovado ou rejeitado",
    },
    default: "pendente",
  },

  aprovado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  data_aprovacao: {
    type: Date,
  },
  observacao_aprovador: {
    type: String,
    maxlength: [1000, "Observação deve ter no máximo 1000 caracteres"],
  },

  // Additional metadata (copied from session for reporting)
  disciplina: {
    type: String,
    required: [true, "Disciplina é obrigatória"],
    trim: true,
    maxlength: [200, "Disciplina deve ter no máximo 200 caracteres"],
  },
  data_sessao: {
    type: Date,
    required: [true, "Data da sessão é obrigatória"],
  },

  data_registro: {
    type: Date,
    default: Date.now,
  },
  data_atualizacao: {
    type: Date,
    default: Date.now,
  },
});

// Unique constraint: one registro per sessao
registroHorasSchema.index({ sessao: 1 }, { unique: true });
registroHorasSchema.index({ tutor: 1, programa: 1, status: 1 });
registroHorasSchema.index({ tutor: 1, data_sessao: -1 });
registroHorasSchema.index({ programa: 1, status: 1 });
registroHorasSchema.index({ aprovado_por: 1 });

// Pre-save hook to update data_atualizacao
registroHorasSchema.pre("save", function (next) {
  this.data_atualizacao = new Date();
  next();
});

module.exports = mongoose.model("RegistroHoras", registroHorasSchema);
