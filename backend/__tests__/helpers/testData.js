const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createTestUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  nome: "Teste User",
  email: "teste@email.com",
  senha: bcrypt.hashSync("Senha123", 10),
  bio: "Biografia teste",
  localizacao: "Sao Paulo",
  isTutor: false,
  disciplinas_dominadas: [],
  disciplinas_precisa: [],
  disponibilidade: [],
  rating: 0,
  total_avaliacoes: 0,
  total_sessoes: 0,
  avaliacoes_recebidas: [],
  sessoes_participadas: [],
  profileCompleted: true,
  ...overrides,
});

const createTestTutor = (overrides = {}) =>
  createTestUser({
    nome: "Tutor Teste",
    email: "tutor@email.com",
    isTutor: true,
    disciplinas_dominadas: [
      { disciplina: "Calculo I", nivel: "Avançado" },
      { disciplina: "Algebra Linear", nivel: "Intermediário" },
    ],
    disponibilidade: [
      {
        _id: new mongoose.Types.ObjectId(),
        data: new Date(Date.now() + 7 * 86400000),
        horario_inicio: "14:00",
        horario_fim: "16:00",
      },
    ],
    rating: 4.5,
    total_avaliacoes: 10,
    total_sessoes: 20,
    ...overrides,
  });

const createTestSessao = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  tutor: new mongoose.Types.ObjectId(),
  aluno: new mongoose.Types.ObjectId(),
  disciplina: "Calculo I",
  data_hora_inicio: new Date(Date.now() + 86400000),
  data_hora_fim: new Date(Date.now() + 86400000 + 3600000),
  status: "Pendente",
  avaliacao_pendente: true,
  observacoes: "",
  ...overrides,
});

const createTestAvaliacao = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  sessao: new mongoose.Types.ObjectId(),
  tutor: new mongoose.Types.ObjectId(),
  aluno: new mongoose.Types.ObjectId(),
  nota: 5,
  comentario: "Otima sessao!",
  ...overrides,
});

const createTestNotificacao = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  usuario: new mongoose.Types.ObjectId(),
  tipo: "sessao_agendada",
  titulo: "Nova sessao agendada!",
  mensagem: "Aluno agendou uma sessao",
  lida: false,
  ...overrides,
});

const generateToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

module.exports = {
  createTestUser,
  createTestTutor,
  createTestSessao,
  createTestAvaliacao,
  createTestNotificacao,
  generateToken,
  hashPassword,
};
