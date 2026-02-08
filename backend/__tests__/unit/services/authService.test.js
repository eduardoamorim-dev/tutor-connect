const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

jest.mock("../../../repositories/userRepository");
jest.mock("../../../config/crypto");
jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        generateAuthUrl: jest.fn().mockReturnValue("https://accounts.google.com/o/oauth2/auth?fake"),
      })),
    },
  },
}));

const authService = require("../../../services/authService");
const userRepository = require("../../../repositories/userRepository");
const { decrypt } = require("../../../config/crypto");
const { AppError } = require("../../../middleware/errorHandler");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------
  // generateJWT
  // -------------------------------------------------------
  describe("generateJWT", () => {
    it("should return a valid JWT string", () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const token = authService.generateJWT(userId);

      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userId);
    });
  });

  // -------------------------------------------------------
  // register
  // -------------------------------------------------------
  describe("register", () => {
    it("should succeed when email is not taken", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({});

      const result = await authService.register("Joao", "joao@email.com", "Senha123");

      expect(result).toEqual({ message: "Usuário criado com sucesso" });
      expect(userRepository.findByEmail).toHaveBeenCalledWith("joao@email.com");
      expect(userRepository.create).toHaveBeenCalledTimes(1);

      // Verify that the password stored is hashed (not plain text)
      const createCall = userRepository.create.mock.calls[0][0];
      expect(createCall.nome).toBe("Joao");
      expect(createCall.email).toBe("joao@email.com");
      expect(createCall.senha).not.toBe("Senha123");
      const isHashed = await bcrypt.compare("Senha123", createCall.senha);
      expect(isHashed).toBe(true);
    });

    it("should throw AppError(400) when fields are missing", async () => {
      await expect(authService.register("", "joao@email.com", "Senha123"))
        .rejects.toThrow(AppError);
      await expect(authService.register("", "joao@email.com", "Senha123"))
        .rejects.toThrow("Todos os campos são obrigatórios");

      await expect(authService.register("Joao", "", "Senha123"))
        .rejects.toThrow(AppError);

      await expect(authService.register("Joao", "joao@email.com", ""))
        .rejects.toThrow(AppError);

      try {
        await authService.register(null, "joao@email.com", "Senha123");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
      }
    });

    it("should throw AppError(400) when email already exists", async () => {
      userRepository.findByEmail.mockResolvedValue({ _id: "existing-id", email: "joao@email.com" });

      try {
        await authService.register("Joao", "joao@email.com", "Senha123");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Email já cadastrado");
      }
    });
  });

  // -------------------------------------------------------
  // login
  // -------------------------------------------------------
  describe("login", () => {
    it("should succeed with valid credentials", async () => {
      const userId = new mongoose.Types.ObjectId();
      const hashedPassword = await bcrypt.hash("Senha123", 10);

      userRepository.findByEmail.mockResolvedValue({
        _id: userId,
        nome: "Joao",
        email: "joao@email.com",
        senha: hashedPassword,
        profileCompleted: true,
      });

      const result = await authService.login("joao@email.com", "Senha123");

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");

      const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
      expect(decoded.id.toString()).toBe(userId.toString());

      expect(result.user).toEqual({
        id: userId,
        nome: "Joao",
        email: "joao@email.com",
        profileCompleted: true,
      });
    });

    it("should throw AppError(400) when fields are missing", async () => {
      try {
        await authService.login("", "Senha123");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Email e senha são obrigatórios");
      }

      try {
        await authService.login("joao@email.com", "");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
      }
    });

    it("should throw AppError(401) when user is not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      try {
        await authService.login("nonexistent@email.com", "Senha123");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Credenciais inválidas");
      }
    });

    it("should throw AppError(401) when user has no senha (Google-only account)", async () => {
      userRepository.findByEmail.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        nome: "Joao",
        email: "joao@email.com",
        senha: null,
        profileCompleted: true,
      });

      try {
        await authService.login("joao@email.com", "Senha123");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Por favor, faça login com o Google");
      }
    });

    it("should throw AppError(401) when password is invalid", async () => {
      const hashedPassword = await bcrypt.hash("CorrectPassword", 10);

      userRepository.findByEmail.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        nome: "Joao",
        email: "joao@email.com",
        senha: hashedPassword,
        profileCompleted: true,
      });

      try {
        await authService.login("joao@email.com", "WrongPassword");
        fail("Expected AppError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe("Credenciais inválidas");
      }
    });
  });

  // -------------------------------------------------------
  // verifyToken
  // -------------------------------------------------------
  describe("verifyToken", () => {
    it("should return { valid: true, user } for a valid token", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
      const mockUser = { _id: userId, nome: "Joao", email: "joao@email.com" };

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.verifyToken(token);

      expect(result.valid).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId.toString());
    });

    it("should return { valid: false } when no token is provided", async () => {
      const result = await authService.verifyToken(null);

      expect(result).toEqual({ valid: false });
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("should return { valid: false } when user is not found", async () => {
      const userId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

      userRepository.findById.mockResolvedValue(null);

      const result = await authService.verifyToken(token);

      expect(result).toEqual({ valid: false });
    });

    it("should return { valid: false } for an invalid/expired token", async () => {
      const result = await authService.verifyToken("invalid-token-string");

      expect(result).toEqual({ valid: false });
      expect(userRepository.findById).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------
  // decryptGoogleToken
  // -------------------------------------------------------
  describe("decryptGoogleToken", () => {
    it("should return null for null input", () => {
      const result = authService.decryptGoogleToken(null);
      expect(result).toBeNull();
    });

    it("should return the decrypted value", () => {
      decrypt.mockReturnValue("decrypted-access-token");

      const result = authService.decryptGoogleToken("encrypted-token");

      expect(result).toBe("decrypted-access-token");
      expect(decrypt).toHaveBeenCalledWith("encrypted-token");
    });

    it("should return the original token when decryption fails", () => {
      decrypt.mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      const result = authService.decryptGoogleToken("plain-token");

      expect(result).toBe("plain-token");
    });
  });
});
