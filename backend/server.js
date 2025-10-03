const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sessaoRoutes = require('./routes/sessoes');
const userRoutes = require('./routes/users'); // Nova rota

const app = express();

// Configuração CORS detalhada
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Erro ao conectar MongoDB:', err);
    process.exit(1);
  });

// Rotas
app.use('/auth', authRoutes);
app.use('/sessoes', sessaoRoutes);
app.use('/users', userRoutes); // Nova rota adicionada

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Tutor Connect funcionando!' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});