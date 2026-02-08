const { validate } = require("../../../middleware/validate");
const { loginSchema } = require("../../../config/schemas");

describe("validate middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should call next() when body is valid", () => {
    req.body = { email: "user@test.com", senha: "SenhaForte1" };
    const middleware = validate(loginSchema);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 when body is invalid", () => {
    req.body = { email: "not-an-email", senha: "" };
    const middleware = validate(loginSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next(error) for non-Zod errors", () => {
    const badSchema = {
      parse: () => {
        throw new Error("unexpected error");
      },
    };
    const middleware = validate(badSchema);

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
