const { z } = require("zod");

const registerSchema = z.object({
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  email: z
    .string({ required_error: "Email é obrigatório" })
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .trim()
    .toLowerCase(),
  senha: z
    .string({ required_error: "Senha é obrigatória" })
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha deve ter no máximo 128 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email é obrigatório" })
    .email("Email inválido")
    .trim()
    .toLowerCase(),
  senha: z
    .string({ required_error: "Senha é obrigatória" })
    .min(1, "Senha é obrigatória"),
});

const createSessionSchema = z.object({
  tutorId: z.string({ required_error: "ID do tutor é obrigatório" }),
  disciplina: z
    .string({ required_error: "Disciplina é obrigatória" })
    .min(1, "Disciplina é obrigatória")
    .max(100, "Disciplina deve ter no máximo 100 caracteres"),
  data_hora_inicio: z
    .string({ required_error: "Data/hora de início é obrigatória" })
    .datetime("Data/hora de início inválida"),
  data_hora_fim: z
    .string({ required_error: "Data/hora de fim é obrigatória" })
    .datetime("Data/hora de fim inválida"),
  observacoes: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
});

const ratingSchema = z.object({
  sessaoId: z.string({ required_error: "ID da sessão é obrigatório" }),
  nota: z
    .number({ required_error: "Nota é obrigatória" })
    .int("Nota deve ser um número inteiro")
    .min(1, "Nota deve ser entre 1 e 5")
    .max(5, "Nota deve ser entre 1 e 5"),
  comentario: z
    .string()
    .max(1000, "Comentário deve ter no máximo 1000 caracteres")
    .optional(),
});

const profileUpdateSchema = z.object({
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  localizacao: z.string().max(100, "Localização deve ter no máximo 100 caracteres").optional(),
  isTutor: z.boolean().optional(),
  disciplinas_dominadas: z
    .array(
      z.object({
        disciplina: z.string().min(1, "Nome da disciplina é obrigatório"),
        nivel: z.enum(["Básico", "Intermediário", "Avançado"]).optional(),
      }),
    )
    .optional(),
  disciplinas_precisa: z
    .array(
      z.object({
        disciplina: z.string().min(1, "Nome da disciplina é obrigatório"),
        nivel_desejado: z.enum(["Básico", "Intermediário", "Avançado"]).optional(),
      }),
    )
    .optional(),
}).passthrough();

const disponibilidadeSchema = z.object({
  data: z
    .string({ required_error: "Data é obrigatória" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  horario_inicio: z
    .string({ required_error: "Horário de início é obrigatório" })
    .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
  horario_fim: z
    .string({ required_error: "Horário de fim é obrigatório" })
    .regex(/^\d{2}:\d{2}$/, "Horário deve estar no formato HH:MM"),
});

module.exports = {
  registerSchema,
  loginSchema,
  createSessionSchema,
  ratingSchema,
  profileUpdateSchema,
  disponibilidadeSchema,
};
