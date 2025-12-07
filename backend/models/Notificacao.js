const mongoose = require("mongoose");

const notificacaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tipo: {
    type: String,
    enum: [
      "sessao_agendada",      // Tutor recebe quando aluno agenda
      "sessao_confirmada",    // Aluno recebe quando tutor confirma
      "sessao_cancelada",     // Ambos recebem quando sessão é cancelada
      "sessao_concluida",     // Ambos recebem quando sessão é concluída
      "avaliacao_pendente",   // Aluno recebe lembrete para avaliar
      "avaliacao_recebida",   // Tutor recebe quando é avaliado
      "lembrete_sessao",      // Lembrete de sessão próxima
    ],
    required: true,
  },
  titulo: { type: String, required: true },
  mensagem: { type: String, required: true },
  sessao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sessao",
  },
  lida: { type: Boolean, default: false },
  data_criacao: { type: Date, default: Date.now },
});

// Índices para buscas otimizadas
notificacaoSchema.index({ usuario: 1, lida: 1 });
notificacaoSchema.index({ usuario: 1, data_criacao: -1 });

module.exports = mongoose.model("Notificacao", notificacaoSchema);
