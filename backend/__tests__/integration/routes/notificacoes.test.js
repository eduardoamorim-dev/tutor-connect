const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../../helpers/appFactory");
const dbHandler = require("../../helpers/dbHandler");
const { generateToken, hashPassword } = require("../../helpers/testData");
const User = require("../../../models/User");
const Notificacao = require("../../../models/Notificacao");

let app;

beforeAll(async () => {
  await dbHandler.connect();
  app = createApp();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function createUser(overrides = {}) {
  const hashedPw = await hashPassword("Senha123");
  return User.create({
    nome: "Aluno Teste",
    email: "aluno@test.com",
    senha: hashedPw,
    profileCompleted: true,
    ...overrides,
  });
}

async function createNotification(userId, overrides = {}) {
  return Notificacao.create({
    usuario: userId,
    tipo: "sessao_agendada",
    titulo: "Nova sessao agendada!",
    mensagem: "Um aluno agendou uma sessao com voce",
    lida: false,
    ...overrides,
  });
}

describe("Notificacoes Routes - Integration", () => {
  // ---------------------------------------------------------------
  // GET /notificacoes
  // ---------------------------------------------------------------
  describe("GET /notificacoes", () => {
    it("should return user's notifications", async () => {
      const user = await createUser();
      const token = generateToken(user._id);

      await createNotification(user._id);
      await createNotification(user._id, {
        tipo: "sessao_confirmada",
        titulo: "Sessao confirmada!",
        mensagem: "O tutor confirmou sua sessao",
      });

      const res = await request(app)
        .get("/notificacoes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/notificacoes");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // GET /notificacoes/count
  // ---------------------------------------------------------------
  describe("GET /notificacoes/count", () => {
    it("should return unread notification count", async () => {
      const user = await createUser();
      const token = generateToken(user._id);

      await createNotification(user._id, { lida: false });
      await createNotification(user._id, {
        lida: false,
        tipo: "sessao_confirmada",
        titulo: "Confirmada",
        mensagem: "Sessao confirmada",
      });
      await createNotification(user._id, {
        lida: true,
        tipo: "sessao_concluida",
        titulo: "Concluida",
        mensagem: "Sessao concluida",
      });

      const res = await request(app)
        .get("/notificacoes/count")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count", 2);
    });
  });

  // ---------------------------------------------------------------
  // PUT /notificacoes/:id/ler
  // ---------------------------------------------------------------
  describe("PUT /notificacoes/:id/ler", () => {
    it("should mark a notification as read", async () => {
      const user = await createUser();
      const token = generateToken(user._id);
      const notif = await createNotification(user._id);

      const res = await request(app)
        .put(`/notificacoes/${notif._id}/ler`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      // Verify it was actually marked as read in the database
      const updated = await Notificacao.findById(notif._id);
      expect(updated.lida).toBe(true);
    });

    it("should return 404 for non-existent notification", async () => {
      const user = await createUser();
      const token = generateToken(user._id);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/notificacoes/${fakeId}/ler`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // PUT /notificacoes/ler-todas
  // ---------------------------------------------------------------
  describe("PUT /notificacoes/ler-todas", () => {
    it("should mark all notifications as read", async () => {
      const user = await createUser();
      const token = generateToken(user._id);

      await createNotification(user._id, { lida: false });
      await createNotification(user._id, {
        lida: false,
        tipo: "sessao_confirmada",
        titulo: "Confirmada",
        mensagem: "Sessao confirmada",
      });
      await createNotification(user._id, {
        lida: false,
        tipo: "sessao_concluida",
        titulo: "Concluida",
        mensagem: "Sessao concluida",
      });

      const res = await request(app)
        .put("/notificacoes/ler-todas")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      // Verify all notifications are now read
      const unread = await Notificacao.countDocuments({
        usuario: user._id,
        lida: false,
      });
      expect(unread).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // DELETE /notificacoes/:id
  // ---------------------------------------------------------------
  describe("DELETE /notificacoes/:id", () => {
    it("should delete a notification", async () => {
      const user = await createUser();
      const token = generateToken(user._id);
      const notif = await createNotification(user._id);

      const res = await request(app)
        .delete(`/notificacoes/${notif._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      // Verify it was removed from database
      const deleted = await Notificacao.findById(notif._id);
      expect(deleted).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // DELETE /notificacoes
  // ---------------------------------------------------------------
  describe("DELETE /notificacoes", () => {
    it("should delete all read notifications", async () => {
      const user = await createUser();
      const token = generateToken(user._id);

      // Create a mix of read and unread notifications
      await createNotification(user._id, { lida: true });
      await createNotification(user._id, {
        lida: true,
        tipo: "sessao_confirmada",
        titulo: "Confirmada",
        mensagem: "Sessao confirmada",
      });
      await createNotification(user._id, {
        lida: false,
        tipo: "sessao_concluida",
        titulo: "Concluida",
        mensagem: "Sessao nao lida",
      });

      const res = await request(app)
        .delete("/notificacoes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      // Only the unread notification should remain
      const remaining = await Notificacao.find({ usuario: user._id });
      expect(remaining.length).toBe(1);
      expect(remaining[0].lida).toBe(false);
    });
  });
});
