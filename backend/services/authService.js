const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

require("dotenv").config();

const authService = {
  generateJWT(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  },

  async register(nome, email, senha) {
    if (!nome || !email || !senha) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email já cadastrado", 400);
    }

    const hashedSenha = await bcrypt.hash(senha, 10);
    await userRepository.create({ nome, email, senha: hashedSenha });

    return { message: "Usuário criado com sucesso" };
  },

  async login(email, senha) {
    if (!email || !senha) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    if (!user.senha) {
      throw new AppError("Por favor, faça login com o Google", 401);
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const token = this.generateJWT(user._id);

    return {
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        profileCompleted: user.profileCompleted,
      },
    };
  },

  async googleCallback(code) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    let user = await userRepository.findByEmail(userInfo.email);

    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(36),
        10,
      );

      user = await userRepository.create({
        nome: userInfo.name || userInfo.email.split("@")[0],
        email: userInfo.email,
        senha: randomPassword,
        googleId: userInfo.id,
      });
    }

    user.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.googleRefreshToken = tokens.refresh_token;
    }
    if (tokens.expiry_date) {
      user.googleTokenExpiry = new Date(tokens.expiry_date);
    }
    await user.save();

    const jwtToken = this.generateJWT(user._id);
    const redirectPath = user.profileCompleted ? "/dashboard" : "/setup-profile";

    return { jwtToken, redirectPath };
  },

  async verifyToken(token) {
    if (!token) {
      return { valid: false };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        return { valid: false };
      }

      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  },

  getGoogleAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });
  },
};

module.exports = authService;
