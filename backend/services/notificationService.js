const notificacaoRepository = require("../repositories/notificacaoRepository");
const { AppError } = require("../middleware/errorHandler");

const notificationService = {
  async list(userId, filters = {}) {
    return notificacaoRepository.findByUser(userId, filters);
  },

  async countUnread(userId) {
    const count = await notificacaoRepository.countUnread(userId);
    return { count };
  },

  async markAsRead(id, userId) {
    const notificacao = await notificacaoRepository.markAsRead(id, userId);
    if (!notificacao) {
      throw new AppError("Notificação não encontrada", 404);
    }
    return { message: "Notificação marcada como lida" };
  },

  async markAllAsRead(userId) {
    await notificacaoRepository.markAllAsRead(userId);
    return { message: "Todas as notificações marcadas como lidas" };
  },

  async deleteById(id, userId) {
    const notificacao = await notificacaoRepository.deleteById(id, userId);
    if (!notificacao) {
      throw new AppError("Notificação não encontrada", 404);
    }
    return { message: "Notificação removida" };
  },

  async deleteAllRead(userId) {
    await notificacaoRepository.deleteAllRead(userId);
    return { message: "Notificações lidas removidas" };
  },
};

module.exports = notificationService;
