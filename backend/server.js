const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
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
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    
    // Executar verificação inicial ao iniciar o servidor
    console.log("Executando verificação inicial de sessões pendentes...");
    cancelarSessoesPendentesExpiradas()
      .then((resultado) => {
        console.log(`Verificação inicial concluída: ${resultado.canceladas} sessões canceladas`);
      })
      .catch((error) => {
        console.error("Erro na verificação inicial:", error);
      });
  })
  .catch((err) => {
    console.error("Erro ao conectar MongoDB:", err);
    process.exit(1);
  });

// Configurar job de cancelamento automático
// Executa a cada 1 minuto
cron.schedule("*/1 * * * *", async () => {
  console.log("\n [CRON] Iniciando verificação de sessões pendentes expiradas...");
  try {
    const resultado = await cancelarSessoesPendentesExpiradas();
    console.log(`[CRON] Verificação concluída: ${resultado.canceladas} sessões canceladas\n`);
  } catch (error) {
    console.error("[CRON] Erro ao executar verificação:", error);
  }
});

console.log("Job de cancelamento automático configurado (executa a cada 10 minutos)");

// Job automático para cancelar sessões expiradas não confirmadas pelo tutor
setInterval(() => {
  cancelarSessoesPendentesExpiradas();
}, 60 * 1000); // a cada 1 minuto

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
    console.log("Executando cancelamento manual de sessões expiradas...");
    const resultado = await cancelarSessoesPendentesExpiradas();
    res.json({
      message: "Verificação executada com sucesso",
      canceladas: resultado.canceladas,
      erros: resultado.erros || 0,
    });
  } catch (error) {
    console.error("Erro ao executar cancelamento manual:", error);
    res.status(500).json({ error: error.message });
  }
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err.stack);
  res.status(500).json({ error: "Algo deu errado!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});