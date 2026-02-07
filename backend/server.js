const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const logger = require("./config/logger");
const httpLogger = require("./middleware/httpLogger");
const { errorHandler } = require("./middleware/errorHandler");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const sessaoRoutes = require("./routes/sessoes");
const userRoutes = require("./routes/users");
const notificacaoRoutes = require("./routes/notificacoes");
const { cancelarSessoesPendentesExpiradas } = require("./service/cancelamentoAutomaticoService");

const app = express();

// Configuração CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(httpLogger);

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB conectado");

    // Executar verificação inicial ao iniciar o servidor
    logger.info("Executando verificação inicial de sessões pendentes...");
    cancelarSessoesPendentesExpiradas()
      .then((resultado) => {
        logger.info(`Verificação inicial concluída: ${resultado.canceladas} sessões canceladas`);
      })
      .catch((error) => {
        logger.error("Erro na verificação inicial:", { error: error.message });
      });
  })
  .catch((err) => {
    logger.error("Erro ao conectar MongoDB:", { error: err.message });
    process.exit(1);
  });

// Configurar job de cancelamento automático (executa a cada 1 minuto)
cron.schedule("*/1 * * * *", async () => {
  logger.info("[CRON] Iniciando verificação de sessões pendentes expiradas...");
  try {
    const resultado = await cancelarSessoesPendentesExpiradas();
    logger.info(`[CRON] Verificação concluída: ${resultado.canceladas} sessões canceladas`);
  } catch (error) {
    logger.error("[CRON] Erro ao executar verificação:", { error: error.message });
  }
});

logger.info("Job de cancelamento automático configurado (executa a cada 1 minuto)");

// Documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use("/auth", authRoutes);
app.use("/sessoes", sessaoRoutes);
app.use("/users", userRoutes);
app.use("/notificacoes", notificacaoRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API Tutor Connect funcionando!" });
});

// Endpoint manual para testar cancelamento automático (útil para desenvolvimento)
app.post("/admin/cancelar-sessoes-expiradas", async (req, res) => {
  try {
    logger.info("Executando cancelamento manual de sessões expiradas...");
    const resultado = await cancelarSessoesPendentesExpiradas();
    res.json({
      message: "Verificação executada com sucesso",
      canceladas: resultado.canceladas,
      erros: resultado.erros || 0,
    });
  } catch (error) {
    logger.error("Erro ao executar cancelamento manual:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Tratamento de erros global
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`URL: http://localhost:${PORT}`);
});
