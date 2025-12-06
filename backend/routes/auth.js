const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const User = require('../models/User');
const router = express.Router();

require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Cadastro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    const hashedSenha = await bcrypt.hash(senha, 10);
    const user = new User({ nome, email, senha: hashedSenha });
    await user.save();
    
    res.status(201).json({ message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    if (!user.senha) {
      return res.status(401).json({ error: 'Por favor, faça login com o Google' });
    }
    
    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        profileCompleted: user.profileCompleted
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(400).json({ error: error.message });
  }
});

// Google OAuth
router.get('/google', (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    });
    
    res.redirect(url);
  } catch (error) {
    console.error('Erro ao iniciar OAuth:', error);
    res.status(500).json({ error: error.message });
  }
});

// Callback do Google
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      return res.redirect(`http://localhost:3000/login?error=${error}`);
    }
    
    if (!code) {
      return res.redirect('http://localhost:3000/login?error=no_code');
    }
    
    // Troca código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Obter informações do usuário
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    
    // Buscar ou criar usuário
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(36),
        10
      );
      
      user = new User({
        nome: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        senha: randomPassword,
        googleId: userInfo.id
      });
    }
    
    // Atualizar tokens
    user.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.googleRefreshToken = tokens.refresh_token;
    }
    if (tokens.expiry_date) {
      user.googleTokenExpiry = new Date(tokens.expiry_date);
    }
    
    await user.save();
    
    // Gerar JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirecionar baseado no status do perfil
    const redirectPath = user.profileCompleted ? '/dashboard' : '/setup-profile';
    res.redirect(`http://localhost:3000${redirectPath}?token=${jwtToken}`);
    
  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    res.redirect('http://localhost:3000/login?error=oauth_failed');
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ valid: false });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-senha -googleAccessToken -googleRefreshToken');
    
    if (!user) {
      return res.status(401).json({ valid: false });
    }
    
    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
