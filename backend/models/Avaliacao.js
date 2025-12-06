const mongoose = require("mongoose");

const avaliacaoSchema = new mongoose.Schema({
  sessao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sessao",
    required: true,
  },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nota: { type: Number, min: 1, max: 5, required: true },
  comentario: { type: String, maxlength: 1000 },
  data: { type: Date, default: Date.now },
});

// Índices
avaliacaoSchema.index({ tutor: 1 });
avaliacaoSchema.index({ sessao: 1 }, { unique: true });

module.exports = mongoose.model("Avaliacao", avaliacaoSchema);
