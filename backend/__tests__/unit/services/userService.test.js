const mongoose = require("mongoose");

jest.mock("../../../repositories/userRepository");
jest.mock("../../../repositories/avaliacaoRepository");

const userService = require("../../../services/userService");
const userRepository = require("../../../repositories/userRepository");
const avaliacaoRepository = require("../../../repositories/avaliacaoRepository");
const { AppError } = require("../../../middleware/errorHandler");

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // getTutors
  // -------------------------------------------------------
  describe("getTutors", () => {
    it("should delegate to userRepository.findTutors", async () => {
      const filters = { disciplina: "Calculo I", page: 1, limit: 10 };
      const mockResult = {
        data: [{ _id: new mongoose.Types.ObjectId(), nome: "Tutor 1", isTutor: true }],
        total: 1,
      };

      userRepository.findTutors.mockResolvedValue(mockResult);

      const result = await userService.getTutors(filters);

      expect(result).toEqual(mockResult);
      expect(userRepository.findTutors).toHaveBeenCalledWith(filters);
    });

    it("should pass empty filters by default", async () => {
      userRepository.findTutors.mockResolvedValue({ data: [], total: 0 });

      await userService.getTutors();

      expect(userRepository.findTutors).toHaveBeenCalledWith({});
    });
  });

  // -------------------------------------------------------
  // getTutorProfile
  // -------------------------------------------------------
  describe("getTutorProfile", () => {
    it("should return tutor and avaliacoes", async () => {
      const tutorId = new mongoose.Types.ObjectId().toString();
      const mockTutor = {
        _id: tutorId,
        nome: "Tutor Teste",
        isTutor: true,
        rating: 4.5,
      };
      const mockAvaliacoes = [
        { _id: new mongoose.Types.ObjectId(), nota: 5, comentario: "Excelente" },
      ];

      userRepository.findById.mockResolvedValue(mockTutor);
      avaliacaoRepository.findByTutor.mockResolvedValue({ data: mockAvaliacoes, total: 1 });

      const result = await userService.getTutorProfile(tutorId);

      expect(result.tutor).toEqual(mockTutor);
      expect(result.avaliacoes).toEqual(mockAvaliacoes);
      expect(userRepository.findById).toHaveBeenCalledWith(tutorId);
      expect(avaliacaoRepository.findByTutor).toHaveBeenCalledWith(tutorId, { limit: 10 });
    });

    it("should throw AppError(404) when tutor is not found", async () => {
      const tutorId = new mongoose.Types.ObjectId().toString();
      userRepository.findById.mockResolvedValue(null);

      try {
        await userService.getTutorProfile(tutorId);
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Tutor não encontrado");
      }
    });

    it("should throw AppError(404) when user exists but is not a tutor", async () => {
      const tutorId = new mongoose.Types.ObjectId().toString();
      userRepository.findById.mockResolvedValue({
        _id: tutorId,
        nome: "Regular User",
        isTutor: false,
      });

      try {
        await userService.getTutorProfile(tutorId);
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Tutor não encontrado");
      }
    });
  });

  // -------------------------------------------------------
  // getProfile
  // -------------------------------------------------------
  describe("getProfile", () => {
    it("should return the user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        nome: "Joao",
        email: "joao@email.com",
        profileCompleted: true,
      };

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("should throw AppError(404) when user is not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      userRepository.findById.mockResolvedValue(null);

      try {
        await userService.getProfile(userId);
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Usuário não encontrado");
      }
    });
  });

  // -------------------------------------------------------
  // updateProfile
  // -------------------------------------------------------
  describe("updateProfile", () => {
    it("should set profileCompleted and update provided fields", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        bio: "Nova bio",
        localizacao: "Rio de Janeiro",
        isTutor: true,
        disciplinas_dominadas: [{ disciplina: "Calculo I", nivel: "Avancado" }],
        disciplinas_precisa: [{ disciplina: "Fisica I" }],
        disponibilidade: [{ dia: "Segunda", horario_inicio: "14:00", horario_fim: "16:00" }],
      };
      const mockUpdatedUser = { _id: userId, ...updateData, profileCompleted: true };

      userRepository.updateById.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(userRepository.updateById).toHaveBeenCalledWith(userId, {
        profileCompleted: true,
        bio: "Nova bio",
        localizacao: "Rio de Janeiro",
        isTutor: true,
        disciplinas_dominadas: [{ disciplina: "Calculo I", nivel: "Avancado" }],
        disciplinas_precisa: [{ disciplina: "Fisica I" }],
        disponibilidade: [{ dia: "Segunda", horario_inicio: "14:00", horario_fim: "16:00" }],
      });
    });

    it("should clear disciplinas_dominadas and disponibilidade when isTutor is false", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        isTutor: false,
        bio: "Sou aluno",
        disciplinas_dominadas: [{ disciplina: "Calculo I", nivel: "Avancado" }],
        disponibilidade: [{ dia: "Segunda", horario_inicio: "14:00", horario_fim: "16:00" }],
      };
      const mockUpdatedUser = {
        _id: userId,
        isTutor: false,
        bio: "Sou aluno",
        disciplinas_dominadas: [],
        disponibilidade: [],
        profileCompleted: true,
      };

      userRepository.updateById.mockResolvedValue(mockUpdatedUser);

      await userService.updateProfile(userId, updateData);

      // The key assertion: when isTutor === false, disciplinas_dominadas and disponibilidade
      // are overridden to empty arrays, regardless of what was passed in.
      const calledWith = userRepository.updateById.mock.calls[0][1];
      expect(calledWith.profileCompleted).toBe(true);
      expect(calledWith.bio).toBe("Sou aluno");
      expect(calledWith.isTutor).toBe(false);
      expect(calledWith.disciplinas_dominadas).toEqual([]);
      expect(calledWith.disponibilidade).toEqual([]);
    });
  });

  // -------------------------------------------------------
  // getUserCount
  // -------------------------------------------------------
  describe("getUserCount", () => {
    it("should delegate to userRepository.countByRole", async () => {
      const mockCounts = { totalTutores: 10, totalAlunos: 50 };
      userRepository.countByRole.mockResolvedValue(mockCounts);

      const result = await userService.getUserCount();

      expect(result).toEqual(mockCounts);
      expect(userRepository.countByRole).toHaveBeenCalled();
    });
  });
});
