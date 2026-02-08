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

// ---------------------------------------------------------------------------
// Helpers for creating test users
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
      { disciplina: "Algebra Linear", nivel: "Intermediário" },
    ],
    disponibilidade: [],
    rating: 4.5,
    total_avaliacoes: 10,
    total_sessoes: 20,
    ...overrides,
  });
}

describe("User Routes - Integration", () => {
  // ---------------------------------------------------------------
  // GET /users/tutores
  // ---------------------------------------------------------------
  describe("GET /users/tutores", () => {
    it("should return list of tutors (authenticated)", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const token = generateToken(student._id);

      const res = await request(app)
        .get("/users/tutores")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const tutorInList = res.body.find(
        (t) => t._id.toString() === tutor._id.toString(),
      );
      expect(tutorInList).toBeDefined();
      expect(tutorInList.nome).toBe("Tutor Teste");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/users/tutores");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // GET /users/tutor/:id
  // ---------------------------------------------------------------
  describe("GET /users/tutor/:id", () => {
    it("should return tutor profile", async () => {
      const student = await createStudent();
      const tutor = await createTutor();
      const token = generateToken(student._id);

      const res = await request(app)
        .get(`/users/tutor/${tutor._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("tutor");
      expect(res.body.tutor).toHaveProperty("nome", "Tutor Teste");
      expect(res.body).toHaveProperty("avaliacoes");
    });

    it("should return 404 for non-tutor user", async () => {
      const student = await createStudent();
      const anotherStudent = await createStudent({
        email: "outro@test.com",
        nome: "Outro Aluno",
      });
      const token = generateToken(student._id);

      const res = await request(app)
        .get(`/users/tutor/${anotherStudent._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // GET /users/profile
  // ---------------------------------------------------------------
  describe("GET /users/profile", () => {
    it("should return authenticated user's profile", async () => {
      const student = await createStudent();
      const token = generateToken(student._id);

      const res = await request(app)
        .get("/users/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("nome", "Aluno Teste");
      expect(res.body).toHaveProperty("email", "aluno@test.com");
    });
  });

  // ---------------------------------------------------------------
  // PUT /users/profile
  // ---------------------------------------------------------------
  describe("PUT /users/profile", () => {
    it("should update profile fields and set profileCompleted=true", async () => {
      const hashedPw = await hashPassword("Senha123");
      const user = await User.create({
        nome: "Incompleto",
        email: "incompleto@test.com",
        senha: hashedPw,
        profileCompleted: false,
      });
      const token = generateToken(user._id);

      const res = await request(app)
        .put("/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          bio: "Nova bio do usuario",
          localizacao: "Rio de Janeiro",
          isTutor: false,
          disciplinas_precisa: [
            { disciplina: "Calculo I", nivel_desejado: "Básico" },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("profileCompleted", true);
      expect(res.body).toHaveProperty("bio", "Nova bio do usuario");
      expect(res.body).toHaveProperty("localizacao", "Rio de Janeiro");
    });
  });

  // ---------------------------------------------------------------
  // POST /users/disponibilidade
  // ---------------------------------------------------------------
  describe("POST /users/disponibilidade", () => {
    it("should add availability slot for tutor user", async () => {
      const tutor = await createTutor();
      const token = generateToken(tutor._id);

      const res = await request(app)
        .post("/users/disponibilidade")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: "2027-06-15",
          horario_inicio: "14:00",
          horario_fim: "16:00",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("disponibilidade");
      expect(res.body.disponibilidade.length).toBeGreaterThanOrEqual(1);
    });

    it("should return 400 for non-tutor user", async () => {
      const student = await createStudent();
      const token = generateToken(student._id);

      const res = await request(app)
        .post("/users/disponibilidade")
        .set("Authorization", `Bearer ${token}`)
        .send({
          data: "2027-06-15",
          horario_inicio: "14:00",
          horario_fim: "16:00",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ---------------------------------------------------------------
  // GET /users/tutor/:id/disponibilidade
  // ---------------------------------------------------------------
  describe("GET /users/tutor/:id/disponibilidade", () => {
    it("should return availability slots for a tutor", async () => {
      const tutor = await createTutor();
      const student = await createStudent();
      const token = generateToken(student._id);

      // Add a future availability slot
      tutor.disponibilidade.push({
        data: new Date("2027-06-15T12:00:00.000Z"),
        horario_inicio: "14:00",
        horario_fim: "16:00",
      });
      await tutor.save();

      const res = await request(app)
        .get(`/users/tutor/${tutor._id}/disponibilidade`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty("horario_inicio", "14:00");
      expect(res.body[0]).toHaveProperty("horario_fim", "16:00");
    });
  });

  // ---------------------------------------------------------------
  // DELETE /users/disponibilidade/:id
  // ---------------------------------------------------------------
  describe("DELETE /users/disponibilidade/:id", () => {
    it("should remove an availability slot", async () => {
      const tutor = await createTutor();
      const token = generateToken(tutor._id);

      // Add a future slot
      tutor.disponibilidade.push({
        data: new Date("2027-07-20T12:00:00.000Z"),
        horario_inicio: "10:00",
        horario_fim: "12:00",
      });
      await tutor.save();

      const slotId =
        tutor.disponibilidade[tutor.disponibilidade.length - 1]._id;

      const res = await request(app)
        .delete(`/users/disponibilidade/${slotId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");

      // Verify slot was removed from DB
      const updatedTutor = await User.findById(tutor._id);
      const slotStillExists = updatedTutor.disponibilidade.some(
        (d) => d._id.toString() === slotId.toString(),
      );
      expect(slotStillExists).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // GET /users/contagem
  // ---------------------------------------------------------------
  describe("GET /users/contagem", () => {
    it("should return user counts without requiring auth", async () => {
      await createStudent();
      await createTutor();

      const res = await request(app).get("/users/contagem");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalTutores");
      expect(res.body).toHaveProperty("totalAlunos");
      expect(typeof res.body.totalTutores).toBe("number");
      expect(typeof res.body.totalAlunos).toBe("number");
      expect(res.body.totalTutores).toBeGreaterThanOrEqual(1);
      expect(res.body.totalAlunos).toBeGreaterThanOrEqual(1);
    });
  });
});
