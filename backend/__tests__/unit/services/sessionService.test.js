const mongoose = require("mongoose");

jest.mock("../../../repositories/sessaoRepository");
jest.mock("../../../repositories/userRepository");
jest.mock("../../../services/googleCalendarService");
jest.mock("../../../helpers/notificacaoHelper");

const sessaoRepository = require("../../../repositories/sessaoRepository");
const userRepository = require("../../../repositories/userRepository");
const googleCalendarService = require("../../../services/googleCalendarService");
const {
  notificarSessaoAgendada,
  notificarSessaoConfirmada,
  notificarSessaoCancelada,
  notificarSessaoConcluida,
  notificarAvaliacaoPendente,
} = require("../../../helpers/notificacaoHelper");
const sessionService = require("../../../services/sessionService");

describe("sessionService", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const tutorId = new mongoose.Types.ObjectId().toString();
  const sessaoId = new mongoose.Types.ObjectId();

  const futureStart = new Date(Date.now() + 86400000).toISOString();
  const futureEnd = new Date(Date.now() + 86400000 + 3600000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createSession ──────────────────────────────────────────────

  describe("createSession", () => {
    it("should create a session successfully", async () => {
      const mockUser = { _id: userId, nome: "Aluno", email: "aluno@test.com" };
      const mockTutor = {
        _id: tutorId,
        nome: "Tutor",
        email: "tutor@test.com",
        isTutor: true,
        googleAccessToken: null,
      };
      const mockSessao = { _id: sessaoId, tutor: tutorId, aluno: userId };
      const mockPopulated = {
        _id: sessaoId,
        tutor: { _id: new mongoose.Types.ObjectId(tutorId), nome: "Tutor" },
        aluno: { _id: new mongoose.Types.ObjectId(userId), nome: "Aluno" },
      };

      userRepository.findByIdFull
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockTutor);
      sessaoRepository.findConflicting.mockResolvedValue(null);
      sessaoRepository.create.mockResolvedValue(mockSessao);
      userRepository.pushSessao.mockResolvedValue();
      notificarSessaoAgendada.mockResolvedValue();
      sessaoRepository.findByIdPopulated.mockResolvedValue(mockPopulated);

      const result = await sessionService.createSession(
        userId,
        tutorId,
        "Calculo I",
        futureStart,
        futureEnd,
        "Obs"
      );

      expect(result).toEqual(mockPopulated);
      expect(sessaoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tutor: tutorId,
          aluno: userId,
          disciplina: "Calculo I",
          status: "Pendente",
        })
      );
      expect(userRepository.pushSessao).toHaveBeenCalledTimes(2);
      expect(notificarSessaoAgendada).toHaveBeenCalledWith(mockSessao, mockUser.nome);
    });

    it("should throw 400 when required fields are missing", async () => {
      await expect(
        sessionService.createSession(userId, null, "Calculo I", futureStart, futureEnd)
      ).rejects.toMatchObject({ statusCode: 400, message: "Todos os campos são obrigatórios" });
    });

    it("should throw 404 when tutor is not found", async () => {
      userRepository.findByIdFull
        .mockResolvedValueOnce({ _id: userId, nome: "Aluno" })
        .mockResolvedValueOnce(null);

      await expect(
        sessionService.createSession(userId, tutorId, "Calculo I", futureStart, futureEnd)
      ).rejects.toMatchObject({ statusCode: 404, message: "Tutor não encontrado" });
    });

    it("should throw 400 when user tries to book session with self", async () => {
      const sameId = userId;
      userRepository.findByIdFull
        .mockResolvedValueOnce({ _id: sameId, nome: "User" })
        .mockResolvedValueOnce({ _id: sameId, nome: "User", isTutor: true });

      await expect(
        sessionService.createSession(sameId, sameId, "Calculo I", futureStart, futureEnd)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Você não pode agendar uma sessão consigo mesmo",
      });
    });

    it("should throw 400 when start time is after or equal to end time", async () => {
      const sameTime = new Date(Date.now() + 86400000).toISOString();

      userRepository.findByIdFull
        .mockResolvedValueOnce({ _id: userId, nome: "Aluno" })
        .mockResolvedValueOnce({ _id: tutorId, nome: "Tutor", isTutor: true });

      await expect(
        sessionService.createSession(userId, tutorId, "Calculo I", sameTime, sameTime)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "A hora de término deve ser depois da hora de início",
      });
    });

    it("should throw 400 when session date is in the past", async () => {
      const pastStart = new Date(Date.now() - 86400000).toISOString();
      const pastEnd = new Date(Date.now() - 86400000 + 3600000).toISOString();

      userRepository.findByIdFull
        .mockResolvedValueOnce({ _id: userId, nome: "Aluno" })
        .mockResolvedValueOnce({ _id: tutorId, nome: "Tutor", isTutor: true });

      await expect(
        sessionService.createSession(userId, tutorId, "Calculo I", pastStart, pastEnd)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível agendar sessões no passado",
      });
    });

    it("should throw 400 when there is a conflicting session", async () => {
      userRepository.findByIdFull
        .mockResolvedValueOnce({ _id: userId, nome: "Aluno" })
        .mockResolvedValueOnce({ _id: tutorId, nome: "Tutor", isTutor: true, googleAccessToken: null });
      sessaoRepository.findConflicting.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

      await expect(
        sessionService.createSession(userId, tutorId, "Calculo I", futureStart, futureEnd)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "O tutor já tem uma sessão agendada neste horário",
      });
    });
  });

  // ─── getUserSessions ────────────────────────────────────────────

  describe("getUserSessions", () => {
    it("should delegate to sessaoRepository.findByUser", async () => {
      const mockSessions = [{ _id: sessaoId }];
      sessaoRepository.findByUser.mockResolvedValue(mockSessions);

      const result = await sessionService.getUserSessions(userId, { status: "Pendente" });

      expect(result).toEqual(mockSessions);
      expect(sessaoRepository.findByUser).toHaveBeenCalledWith(userId, { status: "Pendente" });
    });
  });

  // ─── getSessionById ─────────────────────────────────────────────

  describe("getSessionById", () => {
    it("should return session when user is a participant", async () => {
      const tutorObjId = new mongoose.Types.ObjectId(tutorId);
      const alunoObjId = new mongoose.Types.ObjectId(userId);
      const mockSessao = {
        _id: sessaoId,
        tutor: { _id: tutorObjId, nome: "Tutor" },
        aluno: { _id: alunoObjId, nome: "Aluno" },
      };
      sessaoRepository.findByIdPopulated.mockResolvedValue(mockSessao);

      const result = await sessionService.getSessionById(sessaoId.toString(), userId);

      expect(result).toEqual(mockSessao);
    });

    it("should throw 404 when session is not found", async () => {
      sessaoRepository.findByIdPopulated.mockResolvedValue(null);

      await expect(
        sessionService.getSessionById(sessaoId.toString(), userId)
      ).rejects.toMatchObject({ statusCode: 404, message: "Sessão não encontrada" });
    });

    it("should throw 403 when user is not a participant", async () => {
      const otherUser = new mongoose.Types.ObjectId().toString();
      const mockSessao = {
        _id: sessaoId,
        tutor: { _id: new mongoose.Types.ObjectId(tutorId), nome: "Tutor" },
        aluno: { _id: new mongoose.Types.ObjectId(userId), nome: "Aluno" },
      };
      sessaoRepository.findByIdPopulated.mockResolvedValue(mockSessao);

      await expect(
        sessionService.getSessionById(sessaoId.toString(), otherUser)
      ).rejects.toMatchObject({ statusCode: 403, message: "Acesso negado" });
    });
  });

  // ─── confirmSession ─────────────────────────────────────────────

  describe("confirmSession", () => {
    it("should confirm a pending session", async () => {
      const tutorObjId = new mongoose.Types.ObjectId(tutorId);
      const alunoObjId = new mongoose.Types.ObjectId(userId);
      const mockSessao = {
        _id: sessaoId,
        tutor: tutorObjId,
        aluno: alunoObjId,
        status: "Pendente",
        save: jest.fn().mockResolvedValue(),
      };
      const mockTutor = { _id: tutorId, nome: "Tutor" };
      const mockPopulated = {
        _id: sessaoId,
        tutor: { _id: tutorObjId, nome: "Tutor" },
        aluno: { _id: alunoObjId, nome: "Aluno" },
        status: "Confirmada",
      };

      sessaoRepository.findById.mockResolvedValue(mockSessao);
      userRepository.findByIdFull.mockResolvedValue(mockTutor);
      notificarSessaoConfirmada.mockResolvedValue();
      sessaoRepository.findByIdPopulated.mockResolvedValue(mockPopulated);

      const result = await sessionService.confirmSession(sessaoId.toString(), tutorId);

      expect(mockSessao.status).toBe("Confirmada");
      expect(mockSessao.save).toHaveBeenCalled();
      expect(notificarSessaoConfirmada).toHaveBeenCalledWith(mockSessao, mockTutor.nome);
      expect(result).toEqual(mockPopulated);
    });

    it("should throw 403 when user is not the tutor", async () => {
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Pendente",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.confirmSession(sessaoId.toString(), userId)
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "Apenas o tutor pode confirmar a sessão",
      });
    });

    it("should throw 400 when session is not Pendente", async () => {
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Confirmada",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.confirmSession(sessaoId.toString(), tutorId)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Apenas sessões pendentes podem ser confirmadas",
      });
    });
  });

  // ─── completeSession ────────────────────────────────────────────

  describe("completeSession", () => {
    it("should complete a session successfully", async () => {
      const tutorObjId = new mongoose.Types.ObjectId(tutorId);
      const alunoObjId = new mongoose.Types.ObjectId(userId);
      const mockSessao = {
        _id: sessaoId,
        tutor: tutorObjId,
        aluno: alunoObjId,
        status: "Confirmada",
        save: jest.fn().mockResolvedValue(),
      };
      const mockTutor = { _id: tutorId, nome: "Tutor" };
      const mockAluno = { _id: userId, nome: "Aluno" };
      const mockPopulated = {
        _id: sessaoId,
        tutor: { _id: tutorObjId, nome: "Tutor" },
        aluno: { _id: alunoObjId, nome: "Aluno" },
        status: "Concluída",
      };

      sessaoRepository.findById.mockResolvedValue(mockSessao);
      userRepository.findByIdFull
        .mockResolvedValueOnce(mockTutor)
        .mockResolvedValueOnce(mockAluno);
      notificarSessaoConcluida.mockResolvedValue();
      notificarAvaliacaoPendente.mockResolvedValue();
      sessaoRepository.findByIdPopulated.mockResolvedValue(mockPopulated);

      const result = await sessionService.completeSession(sessaoId.toString(), tutorId);

      expect(mockSessao.status).toBe("Concluída");
      expect(mockSessao.save).toHaveBeenCalled();
      expect(notificarSessaoConcluida).toHaveBeenCalledTimes(2);
      expect(notificarAvaliacaoPendente).toHaveBeenCalledWith(mockSessao, mockTutor.nome);
      expect(result).toEqual(mockPopulated);
    });

    it("should throw 403 when user is not a participant", async () => {
      const otherUser = new mongoose.Types.ObjectId().toString();
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Confirmada",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.completeSession(sessaoId.toString(), otherUser)
      ).rejects.toMatchObject({ statusCode: 403, message: "Acesso negado" });
    });

    it("should throw 400 when session is Cancelada", async () => {
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Cancelada",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.completeSession(sessaoId.toString(), tutorId)
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Sessão cancelada não pode ser concluída",
      });
    });
  });

  // ─── cancelSession ──────────────────────────────────────────────

  describe("cancelSession", () => {
    it("should cancel a session successfully", async () => {
      const tutorObjId = new mongoose.Types.ObjectId(tutorId);
      const alunoObjId = new mongoose.Types.ObjectId(userId);
      const mockSessao = {
        _id: sessaoId,
        tutor: tutorObjId,
        aluno: alunoObjId,
        status: "Pendente",
        googleEventId: null,
        save: jest.fn().mockResolvedValue(),
      };
      const mockUser = { _id: userId, nome: "Aluno" };
      const mockPopulated = {
        _id: sessaoId,
        tutor: { _id: tutorObjId, nome: "Tutor" },
        aluno: { _id: alunoObjId, nome: "Aluno" },
        status: "Cancelada",
      };

      sessaoRepository.findById.mockResolvedValue(mockSessao);
      userRepository.findByIdFull.mockResolvedValue(mockUser);
      notificarSessaoCancelada.mockResolvedValue();
      sessaoRepository.findByIdPopulated.mockResolvedValue(mockPopulated);

      const result = await sessionService.cancelSession(sessaoId.toString(), userId, "Motivo teste");

      expect(mockSessao.status).toBe("Cancelada");
      expect(mockSessao.motivo_cancelamento).toBe("Motivo teste");
      expect(mockSessao.cancelado_por).toBe(userId);
      expect(mockSessao.save).toHaveBeenCalled();
      expect(notificarSessaoCancelada).toHaveBeenCalledWith(
        mockSessao,
        userId,
        mockUser.nome,
        tutorObjId
      );
      expect(result).toEqual(mockPopulated);
    });

    it("should throw 403 when user is not a participant", async () => {
      const otherUser = new mongoose.Types.ObjectId().toString();
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Pendente",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.cancelSession(sessaoId.toString(), otherUser, "Motivo")
      ).rejects.toMatchObject({ statusCode: 403, message: "Acesso negado" });
    });

    it("should throw 400 when session is Concluída", async () => {
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Concluída",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.cancelSession(sessaoId.toString(), tutorId, "Motivo")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Sessão concluída não pode ser cancelada",
      });
    });

    it("should throw 400 when session is already Cancelada", async () => {
      const mockSessao = {
        _id: sessaoId,
        tutor: new mongoose.Types.ObjectId(tutorId),
        aluno: new mongoose.Types.ObjectId(userId),
        status: "Cancelada",
        save: jest.fn().mockResolvedValue(),
      };
      sessaoRepository.findById.mockResolvedValue(mockSessao);

      await expect(
        sessionService.cancelSession(sessaoId.toString(), tutorId, "Motivo")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Sessão já está cancelada",
      });
    });
  });
});
