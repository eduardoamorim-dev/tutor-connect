const mongoose = require("mongoose");

const instituicaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "Nome da instituição é obrigatório"],
    unique: true,
    trim: true,
    minlength: [3, "Nome deve ter no mínimo 3 caracteres"],
    maxlength: [200, "Nome deve ter no máximo 200 caracteres"],
  },
  sigla: {
    type: String,
    required: [true, "Sigla é obrigatória"],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [2, "Sigla deve ter no mínimo 2 caracteres"],
    maxlength: [20, "Sigla deve ter no máximo 20 caracteres"],
  },
  tipo: {
    type: String,
    required: [true, "Tipo de instituição é obrigatório"],
    enum: {
      values: ["publica", "privada", "federal", "estadual"],
      message: "Tipo deve ser: publica, privada, federal ou estadual",
    },
  },
  cnpj: {
    type: String,
    sparse: true,
    trim: true,
  },
  logo_url: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },

  // Configuration for hour requirements by academic level
  configuracoes: {
    horas_mestrado: {
      type: Number,
      default: 60,
      min: [0, "Horas de mestrado não pode ser negativo"],
    },
    horas_doutorado: {
      type: Number,
      default: 120,
      min: [0, "Horas de doutorado não pode ser negativo"],
    },
    permite_certificado_automatico: {
      type: Boolean,
      default: true,
    },
    requer_aprovacao_horas: {
      type: Boolean,
      default: true,
    },
  },

  // Admin contacts
  contato_email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  contato_telefone: {
    type: String,
    trim: true,
  },

  ativo: {
    type: Boolean,
    default: true,
  },
  data_criacao: {
    type: Date,
    default: Date.now,
  },
  data_atualizacao: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
instituicaoSchema.index({ nome: 1 });
instituicaoSchema.index({ sigla: 1 });
instituicaoSchema.index({ ativo: 1 });

// Pre-save hook to update data_atualizacao
instituicaoSchema.pre("save", function (next) {
  this.data_atualizacao = new Date();
  next();
});

module.exports = mongoose.model("Instituicao", instituicaoSchema);
