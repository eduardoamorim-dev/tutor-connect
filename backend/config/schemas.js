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
  senha: z.string({ required_error: "Senha é obrigatória" }).min(1, "Senha é obrigatória"),
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
  observacoes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
});

const ratingSchema = z.object({
  sessaoId: z.string({ required_error: "ID da sessão é obrigatório" }),
  nota: z
    .number({ required_error: "Nota é obrigatória" })
    .int("Nota deve ser um número inteiro")
    .min(1, "Nota deve ser entre 1 e 5")
    .max(5, "Nota deve ser entre 1 e 5"),
  comentario: z.string().max(1000, "Comentário deve ter no máximo 1000 caracteres").optional(),
});

const profileUpdateSchema = z
  .object({
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
  })
  .passthrough();

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

// Institution schemas
const createInstituicaoSchema = z.object({
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .trim(),
  sigla: z
    .string({ required_error: "Sigla é obrigatória" })
    .min(2, "Sigla deve ter pelo menos 2 caracteres")
    .max(20, "Sigla deve ter no máximo 20 caracteres")
    .trim()
    .toUpperCase(),
  tipo: z.enum(["publica", "privada", "federal", "estadual"], {
    errorMap: () => ({ message: "Tipo deve ser: publica, privada, federal ou estadual" }),
  }),
  cnpj: z.string().trim().optional(),
  logo_url: z.string().url("URL do logo inválida").optional(),
  website: z.string().url("URL do website inválida").optional(),
  configuracoes: z
    .object({
      horas_mestrado: z.number().int().min(0, "Horas de mestrado não pode ser negativo").optional(),
      horas_doutorado: z
        .number()
        .int()
        .min(0, "Horas de doutorado não pode ser negativo")
        .optional(),
      permite_certificado_automatico: z.boolean().optional(),
      requer_aprovacao_horas: z.boolean().optional(),
    })
    .optional(),
  contato_email: z.string().email("Email inválido").optional(),
  contato_telefone: z.string().optional(),
});

const updateInstituicaoSchema = createInstituicaoSchema.partial();

// Program schemas
const createProgramaSchema = z.object({
  instituicaoId: z.string({ required_error: "ID da instituição é obrigatório" }),
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(200, "Nome deve ter no máximo 200 caracteres")
    .trim(),
  codigo: z.string().trim().toUpperCase().optional(),
  departamento: z.string().max(200, "Departamento deve ter no máximo 200 caracteres").optional(),
  area_conhecimento: z
    .string()
    .max(200, "Área do conhecimento deve ter no máximo 200 caracteres")
    .optional(),
  nivel: z.enum(["graduacao", "mestrado", "doutorado", "pos-doutorado"], {
    errorMap: () => ({
      message: "Nível deve ser: graduacao, mestrado, doutorado ou pos-doutorado",
    }),
  }),
  horas_aula_obrigatorias: z
    .number()
    .int()
    .min(0, "Horas obrigatórias não pode ser negativo")
    .optional(),
  catalogo_disciplinas_url: z.string().url("URL do catálogo inválida").optional(),
});

const updateProgramaSchema = createProgramaSchema.partial();

const assignCoordinatorSchema = z.object({
  userId: z.string({ required_error: "ID do usuário é obrigatório" }),
});

// Academic profile schema
const updateAcademicProfileSchema = z.object({
  nivel_academico: z
    .enum(["graduacao", "mestrado", "doutorado", "pos-doutorado"], {
      errorMap: () => ({
        message: "Nível acadêmico deve ser: graduacao, mestrado, doutorado ou pos-doutorado",
      }),
    })
    .optional(),
  instituicaoId: z.string().optional(),
  programaId: z.string().optional(),
  lattes_url: z.string().url("URL do Lattes inválida").optional(),
  orcid: z.string().optional(),
  linha_pesquisa: z
    .string()
    .max(500, "Linha de pesquisa deve ter no máximo 500 caracteres")
    .optional(),
  area_concentracao: z
    .string()
    .max(200, "Área de concentração deve ter no máximo 200 caracteres")
    .optional(),
});

// Role update schema
const updateRoleSchema = z.object({
  role: z.enum(["student", "tutor", "coordinator", "admin"], {
    errorMap: () => ({ message: "Role deve ser: student, tutor, coordinator ou admin" }),
  }),
});

// Hours approval schemas
const approveHoursSchema = z.object({
  aprovado: z.boolean({ required_error: "Campo 'aprovado' é obrigatório" }),
  observacao: z.string().max(1000, "Observação deve ter no máximo 1000 caracteres").optional(),
});

const bulkApproveHoursSchema = z.object({
  registroIds: z
    .array(z.string())
    .min(1, "Pelo menos um ID deve ser fornecido")
    .max(100, "Máximo de 100 IDs por requisição"),
});

module.exports = {
  registerSchema,
  loginSchema,
  createSessionSchema,
  ratingSchema,
  profileUpdateSchema,
  disponibilidadeSchema,
  createInstituicaoSchema,
  updateInstituicaoSchema,
  createProgramaSchema,
  updateProgramaSchema,
  assignCoordinatorSchema,
  updateAcademicProfileSchema,
  updateRoleSchema,
  approveHoursSchema,
  bulkApproveHoursSchema,
};
