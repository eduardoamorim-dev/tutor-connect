const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const User = require('../models/User');
const router = express.Router();

require('dotenv').config();

// Debug das variáveis
console.log('=== CONFIGURAÇÃO OAUTH ===');
console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***' + process.env.GOOGLE_CLIENT_SECRET.slice(-4) : 'NÃO DEFINIDO');
console.log('REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('========================');

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
        email: user.email
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
    console.log('🔵 [GET /google] Iniciando autenticação Google...');
    
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
    
    console.log('✅ [GET /google] URL gerada, redirecionando...');
    res.redirect(url);
  } catch (error) {
    console.error('❌ [GET /google] Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Callback do Google - COM DEBUG COMPLETO
router.get('/google/callback', async (req, res) => {
  console.log('🟡 [CALLBACK] Requisição recebida');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ [CALLBACK] Erro retornado pelo Google:', error);
      return res.status(400).send(`Erro do Google: ${error}`);
    }
    
    if (!code) {
      console.error('❌ [CALLBACK] Código não recebido');
      return res.status(400).send('Código de autorização não recebido');
    }
    
    console.log('🔵 [CALLBACK] Código recebido:', code.substring(0, 20) + '...');
    console.log('🔵 [CALLBACK] Trocando código por tokens...');
    
    // Troca código por tokens
    let tokens;
    try {
      const tokenResponse = await oauth2Client.getToken(code);
      tokens = tokenResponse.tokens;
      console.log('✅ [CALLBACK] Tokens obtidos com sucesso');
      console.log('Access Token:', tokens.access_token ? 'Presente' : 'Ausente');
      console.log('Refresh Token:', tokens.refresh_token ? 'Presente' : 'Ausente');
    } catch (tokenError) {
      console.error('❌ [CALLBACK] Erro ao obter tokens:', tokenError.message);
      return res.status(400).send('Erro ao obter tokens do Google');
    }
    
    oauth2Client.setCredentials(tokens);
    
    // Obter informações do usuário
    console.log('🔵 [CALLBACK] Obtendo informações do usuário...');
    let userInfo;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      userInfo = data;
      console.log('✅ [CALLBACK] Informações obtidas:', userInfo.email);
    } catch (userError) {
      console.error('❌ [CALLBACK] Erro ao obter userinfo:', userError.message);
      return res.status(400).send('Erro ao obter informações do usuário');
    }
    
    // Buscar ou criar usuário
    console.log('🔵 [CALLBACK] Processando usuário no banco...');
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      console.log('🆕 [CALLBACK] Criando novo usuário...');
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36) + Date.now().toString(36),
        10
      );
      
      user = new User({
        nome: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email,
        senha: randomPassword
      });
    } else {
      console.log('👤 [CALLBACK] Usuário existente encontrado');
    }
    
    // Atualizar tokens
    user.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      user.googleRefreshToken = tokens.refresh_token;
    }
    
    await user.save();
    console.log('✅ [CALLBACK] Usuário salvo com sucesso');
    
    // Gerar JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ [CALLBACK] JWT gerado');
    
    // Redirecionar
    const redirectUrl = `http://localhost:3000/dashboard?token=${jwtToken}`;
    console.log('🔵 [CALLBACK] Redirecionando para:', redirectUrl);
    
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ [CALLBACK] Erro geral:', error);
    console.error('Stack:', error.stack);
    res.status(500).send('Erro interno no servidor');
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
    const user = await User.findById(decoded.id).select('-senha');
    
    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;