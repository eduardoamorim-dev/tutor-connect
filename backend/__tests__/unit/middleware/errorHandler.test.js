const { AppError, asyncHandler, errorHandler } = require("../../../middleware/errorHandler");

// Mock logger to prevent file I/O during tests
jest.mock("../../../config/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe("errorHandler module", () => {
  // ─── AppError ───────────────────────────────────────────────────

  describe("AppError", () => {
    it("should create an error with the correct statusCode and isOperational flag", () => {
      const error = new AppError("Not found", 404);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Not found");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });

  // ─── asyncHandler ──────────────────────────────────────────────

  describe("asyncHandler", () => {
    it("should catch rejected promises and pass the error to next", async () => {
      const error = new Error("async failure");
      const fn = jest.fn().mockRejectedValue(error);
      const req = {};
      const res = {};
      const next = jest.fn();

      const handler = asyncHandler(fn);
      await handler(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ─── errorHandler ──────────────────────────────────────────────

  describe("errorHandler", () => {
    let res, next;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it("should return the operational error message with its statusCode", () => {
      const err = new AppError("Recurso não encontrado", 404);

      errorHandler(err, {}, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Recurso não encontrado" });
    });

    it("should return generic message for non-operational errors", () => {
      const err = new Error("something broke internally");

      errorHandler(err, {}, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Algo deu errado!" });
    });
  });
});
