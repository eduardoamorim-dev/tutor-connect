jest.mock("../../../services/googleCalendarService", () => ({
  createEvent: jest.fn().mockResolvedValue(null),
  deleteEvent: jest.fn().mockResolvedValue(true),
  createOAuth2Client: jest.fn(),
  refreshTokenIfNeeded: jest.fn(),
}));

const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../../helpers/appFactory");
const dbHandler = require("../../helpers/dbHandler");
const { generateToken, hashPassword } = require("../../helpers/testData");
const User = require("../../../models/User");
const Sessao = require("../../../models/Sessao");
const Avaliacao = require("../../../models/Avaliacao");

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
async function createStudent(overrides = {}) {
  const hashedPw = await hashPassword("Senha123");
  return User.create({
    nome: "Aluno Teste",
    email: "aluno@test.com",
    senha: hashedPw,
    profileCompleted: true,
    ...overrides,
  });
}

async function createTutor(overrides = {}) {
  const hashedPw = await hashPassword("Senha123");
  return User.create({
    nome: "Tutor Teste",
    email: "tutor@test.com",
    senha: hashedPw,
    isTutor: true,
    profileCompleted: true,
    disciplinas_dominadas: [
      { disciplina: "Calculo I", nivel: "Avançado" },
    ],
    rating: 4.5,
    total_avaliacoes: 5,
    total_sessoes: 10,
    ...overrides,
  });
}

// Future date helpers (well in the future to avoid "past date" errors)
function futureStart() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  d.setHours(14, 0, 0, 0);
  return d;
}

function futureEnd() {
  const d = futureStart();
  d.setHours(15, 0, 0, 0);
  return d;
}

describe("Sessoes Routes - Integration", () => {
  // ---------------------------------------------------------------
  // POST /sessoes/create
  // ---------------------------------------------------------------
  describe("POST /sessoes/create", () => {
    it("should create a session and return 201", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const token = generateToken(student._id);

      const res = await request(app)
        .post("/sessoes/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          tutorId: tutor._id.toString(),
          disciplina: "Calculo I",
          data_hora_inicio: futureStart().toISOString(),
          data_hora_fim: futureEnd().toISOString(),
          observacoes: "Preciso de ajuda com limites",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("sessao");
      expect(res.body.sessao).toHaveProperty("status", "Pendente");
      expect(res.body.sessao).toHaveProperty("disciplina", "Calculo I");

      // Verify session was persisted
      const sessions = await Sessao.find({});
      expect(sessions.length).toBe(1);
    });

    it("should return 400 for missing required fields", async () => {
      const student = await createStudent();
      const token = generateToken(student._id);

      const res = await request(app)
        .post("/sessoes/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          disciplina: "Calculo I",
          // missing tutorId, data_hora_inicio, data_hora_fim
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 400 for self-booking", async () => {
      const tutor = await createTutor();
      const token = generateToken(tutor._id);

      const res = await request(app)
        .post("/sessoes/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          tutorId: tutor._id.toString(),
          disciplina: "Calculo I",
          data_hora_inicio: futureStart().toISOString(),
          data_hora_fim: futureEnd().toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // GET /sessoes/minhas-sessoes
  // ---------------------------------------------------------------
  describe("GET /sessoes/minhas-sessoes", () => {
    it("should return the user's sessions", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const token = generateToken(student._id);

      // Create a session directly
      await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Pendente",
      });

      const res = await request(app)
        .get("/sessoes/minhas-sessoes")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty("disciplina", "Calculo I");
    });
  });

  // ---------------------------------------------------------------
  // PUT /sessoes/:id/confirmar
  // ---------------------------------------------------------------
  describe("PUT /sessoes/:id/confirmar", () => {
    it("should allow the tutor to confirm a pending session", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const tutorToken = generateToken(tutor._id);

      const sessao = await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Pendente",
      });

      const res = await request(app)
        .put(`/sessoes/${sessao._id}/confirmar`)
        .set("Authorization", `Bearer ${tutorToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sessao");
      expect(res.body.sessao).toHaveProperty("status", "Confirmada");
    });

    it("should return 403 when student tries to confirm", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const studentToken = generateToken(student._id);

      const sessao = await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Pendente",
      });

      const res = await request(app)
        .put(`/sessoes/${sessao._id}/confirmar`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // PUT /sessoes/:id/concluir
  // ---------------------------------------------------------------
  describe("PUT /sessoes/:id/concluir", () => {
    it("should mark session as completed", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const tutorToken = generateToken(tutor._id);

      const sessao = await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Confirmada",
      });

      const res = await request(app)
        .put(`/sessoes/${sessao._id}/concluir`)
        .set("Authorization", `Bearer ${tutorToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sessao");
      expect(res.body.sessao).toHaveProperty("status", "Concluída");
    });
  });

  // ---------------------------------------------------------------
  // PUT /sessoes/:id/cancelar
  // ---------------------------------------------------------------
  describe("PUT /sessoes/:id/cancelar", () => {
    it("should cancel a pending session", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const studentToken = generateToken(student._id);

      const sessao = await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Pendente",
      });

      const res = await request(app)
        .put(`/sessoes/${sessao._id}/cancelar`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ motivo: "Nao posso mais" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("sessao");
      expect(res.body.sessao).toHaveProperty("status", "Cancelada");
    });
  });

  // ---------------------------------------------------------------
  // POST /sessoes/avaliar
  // ---------------------------------------------------------------
  describe("POST /sessoes/avaliar", () => {
    it("should rate a completed session (student rates)", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const studentToken = generateToken(student._id);

      const sessao = await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Concluída",
        avaliacao_pendente: true,
      });

      const res = await request(app)
        .post("/sessoes/avaliar")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          sessaoId: sessao._id.toString(),
          nota: 5,
          comentario: "Excelente tutor!",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("avaliacao");
      expect(res.body.avaliacao).toHaveProperty("nota", 5);

      // Verify avaliacao was persisted
      const avaliacoes = await Avaliacao.find({});
      expect(avaliacoes.length).toBe(1);
    });

    it("should return 400 for non-completed session", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const studentToken = generateToken(student._id);

      const sessao = await Sessao.create({
        tutor: tutor._id,
        aluno: student._id,
        disciplina: "Calculo I",
        data_hora_inicio: futureStart(),
        data_hora_fim: futureEnd(),
        status: "Pendente",
        avaliacao_pendente: true,
      });

      const res = await request(app)
        .post("/sessoes/avaliar")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          sessaoId: sessao._id.toString(),
          nota: 5,
          comentario: "Otima sessao",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // Full session lifecycle: create -> confirm -> complete -> rate
  // ---------------------------------------------------------------
  describe("Full session lifecycle", () => {
    it("should flow through create -> confirm -> complete -> rate", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const studentToken = generateToken(student._id);
      const tutorToken = generateToken(tutor._id);

      // 1. Student creates a session
      const createRes = await request(app)
        .post("/sessoes/create")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          tutorId: tutor._id.toString(),
          disciplina: "Calculo I",
          data_hora_inicio: futureStart().toISOString(),
          data_hora_fim: futureEnd().toISOString(),
        });

      expect(createRes.status).toBe(201);
      const sessaoId = createRes.body.sessao._id;

      // 2. Tutor confirms
      const confirmRes = await request(app)
        .put(`/sessoes/${sessaoId}/confirmar`)
        .set("Authorization", `Bearer ${tutorToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.sessao.status).toBe("Confirmada");

      // 3. Tutor marks as completed
      const completeRes = await request(app)
        .put(`/sessoes/${sessaoId}/concluir`)
        .set("Authorization", `Bearer ${tutorToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.sessao.status).toBe("Concluída");

      // 4. Student rates
      const rateRes = await request(app)
        .post("/sessoes/avaliar")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          sessaoId: sessaoId,
          nota: 4,
          comentario: "Muito bom!",
        });

      expect(rateRes.status).toBe(200);
      expect(rateRes.body).toHaveProperty("avaliacao");
      expect(rateRes.body.avaliacao.nota).toBe(4);
    });
  });
});
