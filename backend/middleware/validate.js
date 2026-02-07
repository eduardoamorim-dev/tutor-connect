const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ error: messages });
    }
    next(error);
  }
};

module.exports = { validate };
