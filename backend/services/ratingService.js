const avaliacaoRepository = require("../repositories/avaliacaoRepository");
const sessaoRepository = require("../repositories/sessaoRepository");
const userRepository = require("../repositories/userRepository");
const { notificarAvaliacaoRecebida } = require("../helpers/notificacaoHelper");
const { AppError } = require("../middleware/errorHandler");

const ratingService = {
  async createRating(userId, sessaoId, nota, comentario) {
    if (!sessaoId || !nota) {
      throw new AppError("Sessão e nota são obrigatórios", 400);
    }

    if (nota < 1 || nota > 5) {
      throw new AppError("Nota deve ser entre 1 e 5", 400);
    }

    const sessao = await sessaoRepository.findById(sessaoId);

    if (!sessao) {
      throw new AppError("Sessão não encontrada", 404);
    }

    if (sessao.aluno.toString() !== userId) {
      throw new AppError("Apenas o aluno pode avaliar a sessão", 403);
    }

    if (sessao.status !== "Concluída") {
      throw new AppError("Apenas sessões concluídas podem ser avaliadas", 400);
    }

    if (!sessao.avaliacao_pendente) {
      throw new AppError("Esta sessão já foi avaliada", 400);
    }

    const avaliacao = await avaliacaoRepository.create({
      sessao: sessaoId,
      tutor: sessao.tutor,
      aluno: userId,
      nota,
      comentario,
    });

    // Atualizar sessao
    sessao.avaliacao = avaliacao._id;
    sessao.avaliacao_pendente = false;
    await sessao.save();

    // Recalcular media via aggregation (corrige race condition)
    const { media, total } = await avaliacaoRepository.calcularMediaTutor(sessao.tutor);

    const tutor = await userRepository.findByIdFull(sessao.tutor);
    tutor.rating = media;
    tutor.total_avaliacoes = total;
    tutor.avaliacoes_recebidas.push(avaliacao._id);
    await tutor.save();

    // Notificar tutor
    const aluno = await userRepository.findByIdFull(userId);
    await notificarAvaliacaoRecebida(avaliacao, sessao, aluno.nome);

    return { message: "Avaliação enviada com sucesso", avaliacao };
  },

  async getTutorRatings(tutorId, options = {}) {
    return avaliacaoRepository.findByTutor(tutorId, options);
  },
};

module.exports = ratingService;
