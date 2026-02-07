const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tutor Connect API",
      version: "1.0.0",
      description: "API para plataforma de tutoria acadêmica Tutor Connect",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nome: { type: "string" },
            email: { type: "string" },
            bio: { type: "string" },
            localizacao: { type: "string" },
            isTutor: { type: "boolean" },
            rating: { type: "number" },
            total_avaliacoes: { type: "integer" },
            total_sessoes: { type: "integer" },
            profileCompleted: { type: "boolean" },
            disciplinas_dominadas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  disciplina: { type: "string" },
                  nivel: { type: "string", enum: ["Básico", "Intermediário", "Avançado"] },
                },
              },
            },
            disciplinas_precisa: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  disciplina: { type: "string" },
                  nivel: { type: "string" },
                },
              },
            },
          },
        },
        Sessao: {
          type: "object",
          properties: {
            _id: { type: "string" },
            tutor: { $ref: "#/components/schemas/UserRef" },
            aluno: { $ref: "#/components/schemas/UserRef" },
            disciplina: { type: "string" },
            data_hora_inicio: { type: "string", format: "date-time" },
            data_hora_fim: { type: "string", format: "date-time" },
            status: { type: "string", enum: ["Pendente", "Confirmada", "Concluída", "Cancelada"] },
            link_meet: { type: "string" },
            observacoes: { type: "string" },
          },
        },
        UserRef: {
          type: "object",
          properties: {
            _id: { type: "string" },
            nome: { type: "string" },
            email: { type: "string" },
          },
        },
        Avaliacao: {
          type: "object",
          properties: {
            _id: { type: "string" },
            sessao: { type: "string" },
            tutor: { type: "string" },
            aluno: { $ref: "#/components/schemas/UserRef" },
            nota: { type: "integer", minimum: 1, maximum: 5 },
            comentario: { type: "string" },
            data: { type: "string", format: "date-time" },
          },
        },
        Notificacao: {
          type: "object",
          properties: {
            _id: { type: "string" },
            usuario: { type: "string" },
            tipo: { type: "string" },
            titulo: { type: "string" },
            mensagem: { type: "string" },
            lida: { type: "boolean" },
            sessao: { type: "string" },
            data_criacao: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
