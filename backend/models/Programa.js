const mongoose = require("mongoose");

const programaSchema = new mongoose.Schema({
  instituicao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instituicao",
    required: [true, "Instituição é obrigatória"],
  },

  nome: {
    type: String,
    required: [true, "Nome do programa é obrigatório"],
    trim: true,
    minlength: [3, "Nome deve ter no mínimo 3 caracteres"],
    maxlength: [200, "Nome deve ter no máximo 200 caracteres"],
  },
  codigo: {
    type: String,
    trim: true,
    uppercase: true,
  },
  departamento: {
    type: String,
    trim: true,
    maxlength: [200, "Departamento deve ter no máximo 200 caracteres"],
  },
  area_conhecimento: {
    type: String,
    trim: true,
    maxlength: [200, "Área do conhecimento deve ter no máximo 200 caracteres"],
  },

  nivel: {
    type: String,
    required: [true, "Nível do programa é obrigatório"],
    enum: {
      values: ["graduacao", "mestrado", "doutorado", "pos-doutorado"],
      message: "Nível deve ser: graduacao, mestrado, doutorado ou pos-doutorado",
    },
  },

  // Hour requirements (can override institution defaults)
  horas_aula_obrigatorias: {
    type: Number,
    min: [0, "Horas obrigatórias não pode ser negativo"],
  },

  // Coordinator (must have role "coordinator")
  coordenador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // Vice-coordinators who can also approve hours
  vice_coordenadores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  // Optional: discipline catalog link
  catalogo_disciplinas_url: {
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

// Unique constraint: institution + nome must be unique
programaSchema.index({ instituicao: 1, nome: 1 }, { unique: true });
programaSchema.index({ instituicao: 1, ativo: 1 });
programaSchema.index({ coordenador: 1 });
programaSchema.index({ nivel: 1 });

// Pre-save hook to update data_atualizacao
programaSchema.pre("save", function (next) {
  this.data_atualizacao = new Date();
  next();
});

module.exports = mongoose.model("Programa", programaSchema);
