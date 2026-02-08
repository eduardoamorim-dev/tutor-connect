const mongoose = require("mongoose");

jest.mock("../../../repositories/notificacaoRepository");

const notificationService = require("../../../services/notificationService");
const notificacaoRepository = require("../../../repositories/notificacaoRepository");
const { AppError } = require("../../../middleware/errorHandler");

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // list
  // -------------------------------------------------------
  describe("list", () => {
    it("should delegate to notificacaoRepository.findByUser", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const filters = { apenasNaoLidas: true, limit: 20 };
      const mockResult = {
        data: [
          {
            _id: new mongoose.Types.ObjectId(),
            titulo: "Nova sessao",
            mensagem: "Voce tem uma nova sessao",
            lida: false,
          },
        ],
        total: 1,
      };

      notificacaoRepository.findByUser.mockResolvedValue(mockResult);

      const result = await notificationService.list(userId, filters);

      expect(result).toEqual(mockResult);
      expect(notificacaoRepository.findByUser).toHaveBeenCalledWith(userId, filters);
    });
  });

  // -------------------------------------------------------
  // countUnread
  // -------------------------------------------------------
  describe("countUnread", () => {
    it("should return { count } with the unread count", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      notificacaoRepository.countUnread.mockResolvedValue(7);

      const result = await notificationService.countUnread(userId);

      expect(result).toEqual({ count: 7 });
      expect(notificacaoRepository.countUnread).toHaveBeenCalledWith(userId);
    });
  });

  // -------------------------------------------------------
  // markAsRead
  // -------------------------------------------------------
  describe("markAsRead", () => {
    it("should succeed when notification is found", async () => {
      const notifId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      notificacaoRepository.markAsRead.mockResolvedValue({
        _id: notifId,
        usuario: userId,
        lida: true,
      });

      const result = await notificationService.markAsRead(notifId, userId);

      expect(result).toEqual({ message: "Notificação marcada como lida" });
      expect(notificacaoRepository.markAsRead).toHaveBeenCalledWith(notifId, userId);
    });

    it("should throw AppError(404) when notification is not found", async () => {
      const notifId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      notificacaoRepository.markAsRead.mockResolvedValue(null);

      try {
        await notificationService.markAsRead(notifId, userId);
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Notificação não encontrada");
      }
    });
  });

  // -------------------------------------------------------
  // markAllAsRead
  // -------------------------------------------------------
  describe("markAllAsRead", () => {
    it("should succeed and return success message", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      notificacaoRepository.markAllAsRead.mockResolvedValue({ modifiedCount: 3 });

      const result = await notificationService.markAllAsRead(userId);

      expect(result).toEqual({ message: "Todas as notificações marcadas como lidas" });
      expect(notificacaoRepository.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  // -------------------------------------------------------
  // deleteById
  // -------------------------------------------------------
  describe("deleteById", () => {
    it("should succeed when notification is found", async () => {
      const notifId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      notificacaoRepository.deleteById.mockResolvedValue({
        _id: notifId,
        usuario: userId,
      });

      const result = await notificationService.deleteById(notifId, userId);

      expect(result).toEqual({ message: "Notificação removida" });
      expect(notificacaoRepository.deleteById).toHaveBeenCalledWith(notifId, userId);
    });

    it("should throw AppError(404) when notification is not found", async () => {
      const notifId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      notificacaoRepository.deleteById.mockResolvedValue(null);

      try {
        await notificationService.deleteById(notifId, userId);
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Notificação não encontrada");
      }
    });
  });

  // -------------------------------------------------------
  // deleteAllRead
  // -------------------------------------------------------
  describe("deleteAllRead", () => {
    it("should succeed and return success message", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      notificacaoRepository.deleteAllRead.mockResolvedValue({ deletedCount: 5 });

      const result = await notificationService.deleteAllRead(userId);

      expect(result).toEqual({ message: "Notificações lidas removidas" });
      expect(notificacaoRepository.deleteAllRead).toHaveBeenCalledWith(userId);
    });
  });
});
