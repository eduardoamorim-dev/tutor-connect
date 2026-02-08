const logger = require("./logger");

const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

const OPTIONAL_VARS = [
  { name: "GOOGLE_CLIENT_ID", group: "Google OAuth" },
  { name: "GOOGLE_CLIENT_SECRET", group: "Google OAuth" },
  { name: "GOOGLE_REDIRECT_URI", group: "Google OAuth" },
  { name: "CORS_ORIGIN", default: "http://localhost:3000" },
  { name: "PORT", default: "5001" },
  { name: "FRONTEND_URL", default: "http://localhost:3000" },
];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    logger.error(`Variáveis de ambiente obrigatórias não definidas: ${missing.join(", ")}`);
    process.exit(1);
  }

  // Verificar variáveis opcionais agrupadas (Google OAuth)
  const googleVars = OPTIONAL_VARS.filter((v) => v.group === "Google OAuth");
  const googleDefined = googleVars.filter((v) => process.env[v.name]);

  if (googleDefined.length > 0 && googleDefined.length < googleVars.length) {
    const googleMissing = googleVars.filter((v) => !process.env[v.name]).map((v) => v.name);
    logger.warn(`Google OAuth parcialmente configurado. Faltam: ${googleMissing.join(", ")}`);
  }

  logger.info("Variáveis de ambiente validadas com sucesso");
}

module.exports = { validateEnv };
