# Tutor Connect

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Uma plataforma colaborativa de tutoria entre pares que conecta estudantes que precisam de ajuda com aqueles que podem ensinar. Desenvolvida com React e Node.js.

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Referência da API](#referência-da-api)
- [Uso](#uso)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Visão Geral

Tutor Connect é uma aplicação web projetada para facilitar a tutoria entre estudantes. A plataforma permite que usuários se registrem como tutores, definam sua disponibilidade e se conectem com alunos que buscam ajuda em disciplinas específicas. As sessões são agendadas com integração automática ao Google Meet para tutorias online.

## Funcionalidades

### Para Alunos

- Buscar tutores por disciplina e disponibilidade
- Visualizar perfis, avaliações e comentários dos tutores
- Agendar sessões de tutoria
- Participar de sessões via links integrados do Google Meet
- Avaliar e comentar sessões concluídas

### Para Tutores

- Cadastrar disciplinas que pode ensinar com níveis de proficiência
- Definir disponibilidade por data e horário
- Confirmar ou recusar solicitações de sessão
- Acompanhar histórico de sessões e avaliações
- Gerenciar agenda de tutorias

### Funcionalidades da Plataforma

- Autenticação via Google OAuth
- Criação automática de eventos no Google Calendar
- Geração de link do Google Meet para cada sessão
- Gerenciamento de status das sessões em tempo real
- Sistema de avaliação e comentários

## Arquitetura

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
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── ProfileSetup.js
    │   │   └── Profile.js
    │   ├── lib/
    │   │   └── utils.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── tailwind.config.js
```

### Stack Tecnológica

**Backend**

- Node.js
- Express.js
- MongoDB com Mongoose
- JSON Web Tokens (JWT)
- Google APIs (OAuth2, Calendar)

**Frontend**

- React 18
- React Router v7
- Tailwind CSS
- Biblioteca de componentes shadcn/ui
- Axios
- Lucide Icons

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 18.0.0 ou superior)
- npm (versão 9.0.0 ou superior)
- MongoDB (versão 6.0 ou superior)
- Git

Você também precisará de:

- Uma conta no Google Cloud Platform com credenciais OAuth 2.0
- Google Calendar API habilitada

## Instalação

### Clonar o Repositório

```bash
git clone https://github.com/eduardoamorim-dev/tutor-connect.git
cd tutor-connect
```

### Configuração do Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações (veja [Configuração](#configuração)).

```bash
npm run dev
```

O servidor iniciará em `http://localhost:5001`.

### Configuração do Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação abrirá em `http://localhost:3000`.

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend` com as seguintes variáveis:

```env
# Banco de Dados
MONGO_URI=mongodb://localhost:27017/tutor-connect

# Autenticação
JWT_SECRET=sua-chave-secreta-jwt

# Google OAuth
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback

# Servidor
PORT=5001
```

### Configuração do Google Cloud Platform

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Habilite as seguintes APIs:
   - Google+ API
   - Google Calendar API
4. Navegue até "APIs e Serviços" > "Credenciais"
5. Crie credenciais de ID do cliente OAuth 2.0
6. Configure a tela de consentimento OAuth
7. Adicione URI de redirecionamento autorizado: `http://localhost:5001/auth/google/callback`
8. Copie o Client ID e Client Secret para seu arquivo `.env`

## Referência da API

### Autenticação

| Método | Endpoint                | Descrição                       |
| ------ | ----------------------- | ------------------------------- |
| GET    | `/auth/google`          | Inicia fluxo de OAuth do Google |
| GET    | `/auth/google/callback` | Callback do OAuth               |
| GET    | `/auth/verify`          | Valida token JWT                |

### Usuários

| Método | Endpoint                           | Descrição                           |
| ------ | ---------------------------------- | ----------------------------------- |
| GET    | `/users/profile`                   | Obtém perfil do usuário atual       |
| PUT    | `/users/profile`                   | Atualiza perfil do usuário          |
| GET    | `/users/tutores`                   | Lista tutores disponíveis           |
| GET    | `/users/tutor/:id`                 | Obtém detalhes do tutor             |
| GET    | `/users/tutor/:id/disponibilidade` | Obtém disponibilidade do tutor      |
| POST   | `/users/disponibilidade`           | Adiciona horário de disponibilidade |
| DELETE | `/users/disponibilidade/:id`       | Remove horário de disponibilidade   |

### Sessões

| Método | Endpoint                             | Descrição                                  |
| ------ | ------------------------------------ | ------------------------------------------ |
| POST   | `/sessoes/create`                    | Cria nova sessão                           |
| GET    | `/sessoes/minhas-sessoes`            | Lista sessões do usuário                   |
| GET    | `/sessoes/:id`                       | Obtém detalhes da sessão                   |
| PUT    | `/sessoes/:id/confirmar`             | Confirma sessão (tutor)                    |
| PUT    | `/sessoes/:id/concluir`              | Marca sessão como concluída                |
| PUT    | `/sessoes/:id/cancelar`              | Cancela sessão                             |
| POST   | `/sessoes/avaliar`                   | Envia avaliação da sessão                  |
| GET    | `/sessoes/avaliacoes/tutor/:tutorId` | Lista avaliações e comentários de um tutor |

### Exemplos de Requisição

**Criar Sessão**

```json
POST /sessoes/create
Authorization: Bearer <token>

{
  "tutorId": "64abc123def456",
  "disciplina": "Cálculo I",
  "data_hora_inicio": "2024-01-15T14:00:00.000Z",
  "data_hora_fim": "2024-01-15T15:00:00.000Z",
  "observacoes": "Preciso de ajuda com derivadas"
}
```

**Atualizar Perfil**

```json
PUT /users/profile
Authorization: Bearer <token>

{
  "bio": "Estudante de Ciência da Computação",
  "localizacao": "São Paulo, SP",
  "isTutor": true,
  "disciplinas_dominadas": [
    { "disciplina": "Programação I", "nivel": "Avançado" }
  ],
  "disciplinas_precisa": [
    { "disciplina": "Cálculo II", "nivel_desejado": "Intermediário" }
  ]
}
```

## Uso

### Fluxo do Usuário

1. **Autenticação**: Usuários fazem login usando sua conta Google
2. **Configuração do Perfil**: Novos usuários completam o processo de onboarding
   - Selecionam papel (apenas aluno ou aluno e tutor)
   - Adicionam disciplinas que precisam de ajuda
   - Se tutor: adicionam disciplinas que podem ensinar
3. **Dashboard**: Usuários podem buscar tutores e gerenciar sessões
4. **Agendamento**: Alunos selecionam horários disponíveis e solicitam sessões
5. **Gerenciamento de Sessões**: Tutores confirmam sessões; ambas as partes entram via Google Meet
6. **Avaliação**: Após conclusão, alunos podem avaliar e comentar sobre tutores

### Fluxo de Status da Sessão

```
Pendente -> Confirmada -> Concluída
    |           |
    v           v
Cancelada   Cancelada
```

## Contribuição

Contribuições são bem-vindas! Leia o [Guia de Contribuição](CONTRIBUTING.md) para informações detalhadas sobre:

- Como configurar o ambiente de desenvolvimento
- Fluxo de trabalho com Git e GitHub
- Padrões de código e commits
- Como abrir Pull Requests
- Como reportar problemas

Se você nunca contribuiu com um projeto open source antes, nosso guia foi feito especialmente para te ajudar a dar os primeiros passos.

## Mantenedores

**Eduardo Amorim** - Criador e Mantenedor Principal

- GitHub: [@eduardoamorim-dev](https://github.com/eduardoamorim-dev)

Este projeto foi desenvolvido como parte de uma pesquisa acadêmica durante a graduação.

## Contribuidores

Agradecemos a todas as pessoas que contribuem para este projeto! ✨

<a href="https://github.com/eduardoamorim-dev/tutor-connect/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=eduardoamorim-dev/tutor-connect" />
</a>

Quer aparecer aqui? Veja nosso [Guia de Contribuição](CONTRIBUTING.md)!

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Agradecimentos

- **Prof. Junio Moreira** - Orientador da pesquisa acadêmica que originou este projeto
- **Meus pais** - Pelo apoio incondicional durante toda a graduação
