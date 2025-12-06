# Tutor Connect

Plataforma de tutoria colaborativa entre estudantes. Conecte-se com colegas que dominam o que você precisa aprender e compartilhe seu conhecimento.

## Funcionalidades

### Para Alunos
- Buscar tutores por disciplina
- Agendar sessões de tutoria
- Ver disponibilidade do tutor antes de agendar
- Avaliar sessões após conclusão
- Gerenciar suas sessões (cancelar, ver detalhes)

### Para Tutores
- Cadastrar disciplinas que domina
- Definir horários de disponibilidade
- Confirmar ou cancelar sessões
- Marcar sessões como concluídas
- Ver avaliações recebidas

### Integração com Google
- Login com Google OAuth
- Criação automática de eventos no Google Calendar
- Link do Google Meet gerado automaticamente

## Estrutura do Projeto

```
tutor-connect/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Sessao.js
│   │   └── Avaliacao.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── sessoes.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ui/          # Componentes shadcn/ui
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── ProfileSetup.js
    │   │   └── Profile.js
    │   ├── lib/
    │   │   └── utils.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB
- Conta Google Cloud (para OAuth e Calendar API)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Configuração do Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative as APIs: Google+ API, Google Calendar API
4. Configure a tela de consentimento OAuth
5. Crie credenciais OAuth 2.0
6. Adicione `http://localhost:5001/auth/google/callback` como URI de redirecionamento
7. Copie Client ID e Client Secret para o `.env`

## Variáveis de Ambiente

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/tutor-connect

# JWT
JWT_SECRET=sua_chave_secreta

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback

# Porta
PORT=5001
```

## Fluxo do Usuário

1. **Login**: Usuário faz login com Google
2. **Onboarding**: Define se quer ser tutor ou apenas aluno
   - Se tutor: cadastra disciplinas e disponibilidade
   - Todos: cadastram disciplinas que precisam aprender
3. **Dashboard**: 
   - Busca tutores por disciplina
   - Vê horários disponíveis
   - Agenda sessões
4. **Sessões**:
   - Tutor confirma a sessão
   - Ambos podem entrar no Meet
   - Após finalizar, marcar como concluída
   - Aluno avalia o tutor

## API Endpoints

### Auth
- `GET /auth/google` - Inicia login Google
- `GET /auth/google/callback` - Callback OAuth
- `GET /auth/verify` - Verifica token JWT

### Users
- `GET /users/profile` - Perfil do usuário logado
- `PUT /users/profile` - Atualiza perfil
- `GET /users/tutores` - Lista tutores
- `GET /users/tutor/:id` - Detalhes do tutor
- `GET /users/tutor/:id/disponibilidade` - Disponibilidade por data

### Sessões
- `POST /sessoes/create` - Criar sessão
- `GET /sessoes/minhas-sessoes` - Listar sessões
- `GET /sessoes/:id` - Detalhes da sessão
- `PUT /sessoes/:id/confirmar` - Confirmar (tutor)
- `PUT /sessoes/:id/concluir` - Marcar como concluída
- `PUT /sessoes/:id/cancelar` - Cancelar
- `POST /sessoes/avaliar` - Avaliar sessão

## Tecnologias

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Google APIs (OAuth, Calendar)
- JWT para autenticação

### Frontend
- React 18
- React Router v7
- Tailwind CSS
- shadcn/ui components
- Axios
- Sonner (toasts)
- Lucide Icons

