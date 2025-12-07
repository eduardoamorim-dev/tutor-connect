const Notificacao = require("../models/Notificacao");

// Helper para criar notificações
const criarNotificacao = async (
  usuario,
  tipo,
  titulo,
  mensagem,
  sessaoId = null,
) => {
  try {
    const notificacao = new Notificacao({
      usuario,
      tipo,
      titulo,
      mensagem,
      sessao: sessaoId,
    });
    await notificacao.save();
    return notificacao;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
};

// Notificação: Sessão agendada (para o tutor)
const notificarSessaoAgendada = async (sessao, nomeAluno) => {
  const dataFormatada = new Date(sessao.data_hora_inicio).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return criarNotificacao(
    sessao.tutor,
    "sessao_agendada",
    "Nova sessão agendada!",
    `${nomeAluno} agendou uma sessão de ${sessao.disciplina} para ${dataFormatada}`,
    sessao._id,
  );
};

// Notificação: Sessão confirmada (para o aluno)
const notificarSessaoConfirmada = async (sessao, nomeTutor) => {
  const dataFormatada = new Date(sessao.data_hora_inicio).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return criarNotificacao(
    sessao.aluno,
    "sessao_confirmada",
    "Sessão confirmada!",
    `${nomeTutor} confirmou sua sessão de ${sessao.disciplina} para ${dataFormatada}`,
    sessao._id,
  );
};

// Notificação: Sessão cancelada
const notificarSessaoCancelada = async (
  sessao,
  canceladoPor,
  nomeQuemCancelou,
  destinatario,
) => {
  return criarNotificacao(
    destinatario,
    "sessao_cancelada",
    "Sessão cancelada",
    `${nomeQuemCancelou} cancelou a sessão de ${sessao.disciplina}${sessao.motivo_cancelamento ? `: "${sessao.motivo_cancelamento}"` : ""}`,
    sessao._id,
  );
};

// Notificação: Sessão concluída
const notificarSessaoConcluida = async (sessao, destinatario, nomeOutro) => {
  return criarNotificacao(
    destinatario,
    "sessao_concluida",
    "Sessão concluída!",
    `Sua sessão de ${sessao.disciplina} com ${nomeOutro} foi concluída`,
    sessao._id,
  );
};

// Notificação: Avaliação pendente (para o aluno)
const notificarAvaliacaoPendente = async (sessao, nomeTutor) => {
  return criarNotificacao(
    sessao.aluno,
    "avaliacao_pendente",
    "Avalie sua sessão!",
    `Como foi sua sessão de ${sessao.disciplina} com ${nomeTutor}? Deixe sua avaliação!`,
    sessao._id,
  );
};

// Notificação: Avaliação recebida (para o tutor)
const notificarAvaliacaoRecebida = async (avaliacao, sessao, nomeAluno) => {
  const estrelas = "⭐".repeat(avaliacao.nota);
  return criarNotificacao(
    sessao.tutor,
    "avaliacao_recebida",
    "Nova avaliação recebida!",
    `${nomeAluno} avaliou sua sessão de ${sessao.disciplina} com ${estrelas}`,
    sessao._id,
  );
};

module.exports = {
  criarNotificacao,
  notificarSessaoAgendada,
  notificarSessaoConfirmada,
  notificarSessaoCancelada,
  notificarSessaoConcluida,
  notificarAvaliacaoPendente,
  notificarAvaliacaoRecebida,
};
