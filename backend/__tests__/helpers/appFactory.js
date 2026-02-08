const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { errorHandler } = require("../../middleware/errorHandler");

const authRoutes = require("../../routes/auth");
const sessaoRoutes = require("../../routes/sessoes");
const userRoutes = require("../../routes/users");
const notificacaoRoutes = require("../../routes/notificacoes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use("/auth", authRoutes);
  app.use("/sessoes", sessaoRoutes);
  app.use("/users", userRoutes);
  app.use("/notificacoes", notificacaoRoutes);

  app.get("/", (req, res) => {
    res.json({ message: "API Tutor Connect funcionando!" });
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
