const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middleware/auth");

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should return 401 when no Authorization header is provided", () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when the token is invalid", () => {
    req.headers.authorization = "Bearer invalid-token-here";

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set req.userId and call next() for a valid token", () => {
    const userId = "abc123";
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
