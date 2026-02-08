const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../../helpers/appFactory");
const dbHandler = require("../../helpers/dbHandler");
const { generateToken, hashPassword } = require("../../helpers/testData");
const User = require("../../../models/User");

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

describe("Auth Routes - Integration", () => {
  // ---------------------------------------------------------------
  // POST /auth/register
  // ---------------------------------------------------------------
  describe("POST /auth/register", () => {
    it("should create a user and return 201 with message", async () => {
      const res = await request(app).post("/auth/register").send({
        nome: "Novo Aluno",
        email: "novo@test.com",
        senha: "Senha123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toMatch(/sucesso/i);

      // Verify user was actually persisted in the database
      const user = await User.findOne({ email: "novo@test.com" });
      expect(user).not.toBeNull();
      expect(user.nome).toBe("Novo Aluno");
    });

    it("should return 400 when email already exists", async () => {
      const hashedPw = await hashPassword("Senha123");
      await User.create({
        nome: "Existente",
        email: "existente@test.com",
        senha: hashedPw,
      });

      const res = await request(app).post("/auth/register").send({
        nome: "Outro",
        email: "existente@test.com",
        senha: "Senha123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 for weak password (no uppercase)", async () => {
      const res = await request(app).post("/auth/register").send({
        nome: "Aluno",
        email: "aluno@test.com",
        senha: "senhafraca123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 when required fields are missing", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "semsenha@test.com",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // POST /auth/login
  // ---------------------------------------------------------------
  describe("POST /auth/login", () => {
    let registeredUser;

    beforeEach(async () => {
      const hashedPw = await hashPassword("Senha123");
      registeredUser = await User.create({
        nome: "Aluno Login",
        email: "login@test.com",
        senha: hashedPw,
        profileCompleted: true,
      });
    });

    it("should return 200 with token and user data", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "login@test.com",
        senha: "Senha123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("nome", "Aluno Login");
      expect(res.body.user).toHaveProperty("email", "login@test.com");
      expect(res.body.user).toHaveProperty("profileCompleted", true);
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "login@test.com",
        senha: "SenhaErrada123",
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "naoexiste@test.com",
        senha: "Senha123",
      });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // GET /auth/verify
  // ---------------------------------------------------------------
  describe("GET /auth/verify", () => {
    it("should return {valid:true, user} for a valid token", async () => {
      const hashedPw = await hashPassword("Senha123");
      const user = await User.create({
        nome: "Verify User",
        email: "verify@test.com",
        senha: hashedPw,
        profileCompleted: true,
      });

      const token = generateToken(user._id);

      const res = await request(app)
        .get("/auth/verify")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("valid", true);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "verify@test.com");
    });

    it("should return {valid:false} for an invalid token", async () => {
      const res = await request(app)
        .get("/auth/verify")
        .set("Authorization", "Bearer invalid-token-xyz");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("valid", false);
    });
  });
});
