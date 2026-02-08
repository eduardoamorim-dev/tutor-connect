const mongoose = require("mongoose");

jest.mock("../../../repositories/avaliacaoRepository");
jest.mock("../../../repositories/sessaoRepository");
jest.mock("../../../repositories/userRepository");
jest.mock("../../../helpers/notificacaoHelper");

const ratingService = require("../../../services/ratingService");
const avaliacaoRepository = require("../../../repositories/avaliacaoRepository");
const sessaoRepository = require("../../../repositories/sessaoRepository");
const userRepository = require("../../../repositories/userRepository");
const { notificarAvaliacaoRecebida } = require("../../../helpers/notificacaoHelper");
const { AppError } = require("../../../middleware/errorHandler");

describe("ratingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // createRating
  // -------------------------------------------------------
  describe("createRating", () => {
    const setupSuccessfulRating = () => {
      const alunoId = new mongoose.Types.ObjectId();
      const tutorId = new mongoose.Types.ObjectId();
      const sessaoId = new mongoose.Types.ObjectId();
      const avaliacaoId = new mongoose.Types.ObjectId();

      const mockSessao = {
        _id: sessaoId,
        aluno: alunoId,
        tutor: tutorId,
        status: "Concluída",
        avaliacao_pendente: true,
        avaliacao: null,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockAvaliacao = {
        _id: avaliacaoId,
      };

      const mockTutor = {
        _id: tutorId,
        rating: 4.0,
        total_avaliacoes: 4,
        avaliacoes_recebidas: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockAluno = {
        _id: alunoId,
        nome: "Aluno",
      };

      sessaoRepository.findById.mockResolvedValue(mockSessao);
      avaliacaoRepository.create.mockResolvedValue(mockAvaliacao);
      avaliacaoRepository.calcularMediaTutor.mockResolvedValue({ media: 4.5, total: 5 });
      userRepository.findByIdFull
        .mockResolvedValueOnce(mockTutor)   // first call: tutor
        .mockResolvedValueOnce(mockAluno);  // second call: aluno
      notificarAvaliacaoRecebida.mockResolvedValue({});

      return { alunoId, tutorId, sessaoId, avaliacaoId, mockSessao, mockAvaliacao, mockTutor, mockAluno };
    };

    it("should succeed with the full rating flow", async () => {
      const { alunoId, tutorId, sessaoId, avaliacaoId, mockSessao, mockAvaliacao, mockTutor } =
        setupSuccessfulRating();

      const result = await ratingService.createRating(alunoId.toString(), sessaoId.toString(), 5, "Excelente aula!");

      // Check result
      expect(result.message).toBe("Avaliação enviada com sucesso");
      expect(result.avaliacao).toEqual(mockAvaliacao);

      // Check avaliacao was created with correct data
      expect(avaliacaoRepository.create).toHaveBeenCalledWith({
        sessao: sessaoId.toString(),
        tutor: tutorId,
        aluno: alunoId.toString(),
        nota: 5,
        comentario: "Excelente aula!",
      });

      // Check sessao was updated
      expect(mockSessao.avaliacao).toBe(avaliacaoId);
      expect(mockSessao.avaliacao_pendente).toBe(false);
      expect(mockSessao.save).toHaveBeenCalled();

      // Check tutor rating was recalculated
      expect(avaliacaoRepository.calcularMediaTutor).toHaveBeenCalledWith(tutorId);
      expect(mockTutor.rating).toBe(4.5);
      expect(mockTutor.total_avaliacoes).toBe(5);
      expect(mockTutor.avaliacoes_recebidas).toContain(avaliacaoId);
      expect(mockTutor.save).toHaveBeenCalled();

      // Check notification was sent
      expect(notificarAvaliacaoRecebida).toHaveBeenCalledWith(
        mockAvaliacao,
        mockSessao,
        "Aluno",
      );
    });

    it("should throw AppError(400) when sessaoId is missing", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      try {
        await ratingService.createRating(userId, null, 5, "Bom");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Sessão e nota são obrigatórios");
      }
    });

    it("should throw AppError(400) when nota is out of range", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const sessaoId = new mongoose.Types.ObjectId().toString();

      try {
        await ratingService.createRating(userId, sessaoId, -1, "Ruim");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Nota deve ser entre 1 e 5");
      }

      try {
        await ratingService.createRating(userId, sessaoId, 6, "Muito bom");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Nota deve ser entre 1 e 5");
      }
    });

    it("should throw AppError(404) when session is not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const sessaoId = new mongoose.Types.ObjectId().toString();

      sessaoRepository.findById.mockResolvedValue(null);

      try {
        await ratingService.createRating(userId, sessaoId, 5, "Bom");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Sessão não encontrada");
      }
    });

    it("should throw AppError(403) when user is not the aluno of the session", async () => {
      const userId = new mongoose.Types.ObjectId();
      const differentAlunoId = new mongoose.Types.ObjectId();
      const sessaoId = new mongoose.Types.ObjectId();

      sessaoRepository.findById.mockResolvedValue({
        _id: sessaoId,
        aluno: differentAlunoId,
        tutor: new mongoose.Types.ObjectId(),
        status: "Concluída",
        avaliacao_pendente: true,
        save: jest.fn(),
      });

      try {
        await ratingService.createRating(userId.toString(), sessaoId.toString(), 5, "Bom");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe("Apenas o aluno pode avaliar a sessão");
      }
    });

    it("should throw AppError(400) when session status is not Concluida", async () => {
      const alunoId = new mongoose.Types.ObjectId();
      const sessaoId = new mongoose.Types.ObjectId();

      sessaoRepository.findById.mockResolvedValue({
        _id: sessaoId,
        aluno: alunoId,
        tutor: new mongoose.Types.ObjectId(),
        status: "Confirmada",
        avaliacao_pendente: true,
        save: jest.fn(),
      });

      try {
        await ratingService.createRating(alunoId.toString(), sessaoId.toString(), 5, "Bom");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Apenas sessões concluídas podem ser avaliadas");
      }
    });

    it("should throw AppError(400) when session has already been rated", async () => {
      const alunoId = new mongoose.Types.ObjectId();
      const sessaoId = new mongoose.Types.ObjectId();

      sessaoRepository.findById.mockResolvedValue({
        _id: sessaoId,
        aluno: alunoId,
        tutor: new mongoose.Types.ObjectId(),
        status: "Concluída",
        avaliacao_pendente: false,
        save: jest.fn(),
      });

      try {
        await ratingService.createRating(alunoId.toString(), sessaoId.toString(), 5, "Bom");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Esta sessão já foi avaliada");
      }
    });
  });

  // -------------------------------------------------------
  // getTutorRatings
  // -------------------------------------------------------
  describe("getTutorRatings", () => {
    it("should delegate to avaliacaoRepository.findByTutor", async () => {
      const tutorId = new mongoose.Types.ObjectId().toString();
      const options = { page: 1, perPage: 10 };
      const mockResult = {
        data: [{ _id: new mongoose.Types.ObjectId(), nota: 5, comentario: "Otimo" }],
        total: 1,
      };

      avaliacaoRepository.findByTutor.mockResolvedValue(mockResult);

      const result = await ratingService.getTutorRatings(tutorId, options);

      expect(result).toEqual(mockResult);
      expect(avaliacaoRepository.findByTutor).toHaveBeenCalledWith(tutorId, options);
    });

    it("should pass empty options by default", async () => {
      const tutorId = new mongoose.Types.ObjectId().toString();
      avaliacaoRepository.findByTutor.mockResolvedValue({ data: [], total: 0 });

      await ratingService.getTutorRatings(tutorId);

      expect(avaliacaoRepository.findByTutor).toHaveBeenCalledWith(tutorId, {});
    });
  });
});
