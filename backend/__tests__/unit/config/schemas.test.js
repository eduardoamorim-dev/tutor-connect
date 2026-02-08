const {
  registerSchema,
  loginSchema,
  createSessionSchema,
  ratingSchema,
  disponibilidadeSchema,
} = require("../../../config/schemas");

describe("Zod validation schemas", () => {
  // ─── registerSchema ─────────────────────────────────────────────

  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const result = registerSchema.safeParse({
        nome: "Joao Silva",
        email: "joao@test.com",
        senha: "SenhaForte1",
      });

      expect(result.success).toBe(true);
    });

    it("should reject when required fields are missing", () => {
      const result = registerSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);
    });

    it("should reject a weak password (no uppercase)", () => {
      const result = registerSchema.safeParse({
        nome: "Joao Silva",
        email: "joao@test.com",
        senha: "senhafraca1",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues.some((e) => e.message.includes("maiúscula"))).toBe(true);
    });
  });

  // ─── loginSchema ────────────────────────────────────────────────

  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({
        email: "user@test.com",
        senha: "SenhaForte1",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        senha: "SenhaForte1",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues.some((e) => e.message.includes("inválido"))).toBe(true);
    });
  });

  // ─── createSessionSchema ───────────────────────────────────────

  describe("createSessionSchema", () => {
    it("should accept valid session data", () => {
      const result = createSessionSchema.safeParse({
        tutorId: "64f1a2b3c4d5e6f7a8b9c0d1",
        disciplina: "Calculo I",
        data_hora_inicio: "2027-06-15T14:00:00.000Z",
        data_hora_fim: "2027-06-15T16:00:00.000Z",
      });

      expect(result.success).toBe(true);
    });

    it("should reject when required fields are missing", () => {
      const result = createSessionSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);
    });
  });

  // ─── ratingSchema ──────────────────────────────────────────────

  describe("ratingSchema", () => {
    it("should accept a valid rating (nota 1-5)", () => {
      const result = ratingSchema.safeParse({
        sessaoId: "64f1a2b3c4d5e6f7a8b9c0d1",
        nota: 4,
        comentario: "Boa sessao",
      });

      expect(result.success).toBe(true);
    });

    it("should reject nota outside the range 1-5", () => {
      const tooLow = ratingSchema.safeParse({
        sessaoId: "64f1a2b3c4d5e6f7a8b9c0d1",
        nota: 0,
      });
      const tooHigh = ratingSchema.safeParse({
        sessaoId: "64f1a2b3c4d5e6f7a8b9c0d1",
        nota: 6,
      });

      expect(tooLow.success).toBe(false);
      expect(tooHigh.success).toBe(false);
    });
  });

  // ─── disponibilidadeSchema ─────────────────────────────────────

  describe("disponibilidadeSchema", () => {
    it("should accept a valid availability format", () => {
      const result = disponibilidadeSchema.safeParse({
        data: "2027-06-15",
        horario_inicio: "14:00",
        horario_fim: "16:00",
      });

      expect(result.success).toBe(true);
    });

    it("should reject an invalid format", () => {
      const result = disponibilidadeSchema.safeParse({
        data: "15/06/2027",
        horario_inicio: "2pm",
        horario_fim: "4pm",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);
    });
  });
});
