const mongoose = require("mongoose");

jest.mock("../../../repositories/userRepository");
jest.mock("../../../repositories/sessaoRepository");

const userRepository = require("../../../repositories/userRepository");
const sessaoRepository = require("../../../repositories/sessaoRepository");
const availabilityService = require("../../../services/availabilityService");

describe("availabilityService", () => {
  const userId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── addSlot ────────────────────────────────────────────────────

  describe("addSlot", () => {
    it("should add a slot successfully", async () => {
      const disponibilidade = [];
      const mockUser = {
        _id: userId,
        isTutor: true,
        disponibilidade,
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);

      const result = await availabilityService.addSlot(userId, "2027-06-15", "14:00", "16:00");

      expect(result.message).toBe("Disponibilidade adicionada");
      expect(mockUser.disponibilidade).toHaveLength(1);
      expect(mockUser.disponibilidade[0].horario_inicio).toBe("14:00");
      expect(mockUser.disponibilidade[0].horario_fim).toBe("16:00");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw 400 when required fields are missing", async () => {
      await expect(
        availabilityService.addSlot(userId, null, "14:00", "16:00")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Todos os campos são obrigatórios",
      });
    });

    it("should throw 400 when user is not a tutor", async () => {
      const mockUser = {
        _id: userId,
        isTutor: false,
        disponibilidade: [],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);

      await expect(
        availabilityService.addSlot(userId, "2027-06-15", "14:00", "16:00")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Apenas tutores podem adicionar disponibilidade",
      });
    });

    it("should throw 400 when date is in the past", async () => {
      const mockUser = {
        _id: userId,
        isTutor: true,
        disponibilidade: [],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);

      await expect(
        availabilityService.addSlot(userId, "2020-01-01", "14:00", "16:00")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível adicionar disponibilidade para data/hora que já passou",
      });
    });

    it("should throw 400 when end time is before or equal to start time", async () => {
      const mockUser = {
        _id: userId,
        isTutor: true,
        disponibilidade: [],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);

      await expect(
        availabilityService.addSlot(userId, "2027-06-15", "16:00", "14:00")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "O horário de fim deve ser depois do horário de início",
      });
    });

    it("should throw 400 when conflicting slot exists", async () => {
      const existingSlot = {
        data: new Date(Date.UTC(2027, 5, 15, 12, 0, 0, 0)),
        horario_inicio: "13:00",
        horario_fim: "15:00",
      };
      const mockUser = {
        _id: userId,
        isTutor: true,
        disponibilidade: [existingSlot],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);

      await expect(
        availabilityService.addSlot(userId, "2027-06-15", "14:00", "16:00")
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Já existe uma disponibilidade neste horário",
      });
    });
  });

  // ─── getAvailableSlots ──────────────────────────────────────────

  describe("getAvailableSlots", () => {
    it("should return slots with jaAgendado status", async () => {
      const futureDate = new Date(Date.UTC(2027, 5, 15, 12, 0, 0, 0));
      const slotObj = {
        _id: new mongoose.Types.ObjectId(),
        data: futureDate,
        horario_inicio: "14:00",
        horario_fim: "16:00",
        toObject: jest.fn().mockReturnValue({
          _id: new mongoose.Types.ObjectId(),
          data: futureDate,
          horario_inicio: "14:00",
          horario_fim: "16:00",
        }),
      };
      const mockTutor = {
        _id: userId,
        isTutor: true,
        disponibilidade: [slotObj],
      };
      userRepository.findByIdFull.mockResolvedValue(mockTutor);
      sessaoRepository.findByTutorFuture.mockResolvedValue([]);

      const result = await availabilityService.getAvailableSlots(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("jaAgendado", false);
      expect(sessaoRepository.findByTutorFuture).toHaveBeenCalledWith(userId);
    });

    it("should throw 404 when tutor is not found", async () => {
      userRepository.findByIdFull.mockResolvedValue(null);

      await expect(
        availabilityService.getAvailableSlots(userId)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Tutor não encontrado",
      });
    });
  });

  // ─── removeSlot ─────────────────────────────────────────────────

  describe("removeSlot", () => {
    it("should remove a slot successfully", async () => {
      const slotId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        disponibilidade: [
          {
            _id: slotId,
            data: new Date(Date.UTC(2027, 5, 15, 12, 0, 0, 0)),
            horario_inicio: "14:00",
            horario_fim: "16:00",
          },
        ],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);
      sessaoRepository.findConflicting.mockResolvedValue(null);

      const result = await availabilityService.removeSlot(userId, slotId.toString());

      expect(result.message).toBe("Disponibilidade removida");
      expect(mockUser.disponibilidade).toHaveLength(0);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw 404 when user is not found", async () => {
      userRepository.findByIdFull.mockResolvedValue(null);

      await expect(
        availabilityService.removeSlot(userId, new mongoose.Types.ObjectId().toString())
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Usuário não encontrado",
      });
    });

    it("should throw 404 when slot is not found", async () => {
      const mockUser = {
        _id: userId,
        disponibilidade: [],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);

      await expect(
        availabilityService.removeSlot(userId, new mongoose.Types.ObjectId().toString())
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Disponibilidade não encontrada",
      });
    });

    it("should throw 400 when a session exists in the slot time range", async () => {
      const slotId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: userId,
        disponibilidade: [
          {
            _id: slotId,
            data: new Date(Date.UTC(2027, 5, 15, 12, 0, 0, 0)),
            horario_inicio: "14:00",
            horario_fim: "16:00",
          },
        ],
        save: jest.fn().mockResolvedValue(),
      };
      userRepository.findByIdFull.mockResolvedValue(mockUser);
      sessaoRepository.findConflicting.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

      await expect(
        availabilityService.removeSlot(userId, slotId.toString())
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Não é possível remover esta disponibilidade pois há uma sessão agendada neste horário",
      });
    });
  });
});
