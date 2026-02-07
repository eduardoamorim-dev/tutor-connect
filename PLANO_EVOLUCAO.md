# Tutor Connect -- Plano de Evolucao e Analise Completa

Documento de analise tecnica, identificacao de problemas, propostas de novas funcionalidades e roadmap de desenvolvimento para transformar o Tutor Connect em uma ferramenta essencial para graduandos, mestrandos e doutorandos.

---

## Sumario

- [Estado Atual do Projeto](#estado-atual-do-projeto)
- [Analise de Potencial](#analise-de-potencial)
- [Novas Funcionalidades Propostas](#novas-funcionalidades-propostas)
- [Problemas Identificados](#problemas-identificados)
- [Melhorias Tecnicas Necessarias](#melhorias-tecnicas-necessarias)
- [Arquitetura Alvo](#arquitetura-alvo)
- [Modelo de Dados Proposto](#modelo-de-dados-proposto)
- [Roadmap de Desenvolvimento](#roadmap-de-desenvolvimento)
- [Stack Tecnologica Recomendada](#stack-tecnologica-recomendada)

---

## Estado Atual do Projeto

### Resumo Tecnico

| Aspecto | Estado | Observacao |
|---------|--------|------------|
| Funcionalidades core | Implementadas | Agendamento, avaliacao, notificacoes |
| Interface (UI/UX) | Boa | Design moderno com Tailwind CSS e Radix UI |
| Seguranca | Requer atencao | Vulnerabilidades criticas identificadas |
| Testes | Inexistentes | 0% de cobertura, nenhum framework configurado |
| Arquitetura backend | Basica | Logica de negocios acoplada nas rotas |
| Arquitetura frontend | Basica | Componentes monoliticos, sem gerenciamento de estado |
| Documentacao | Parcial | README existente, sem docs de API (Swagger) |
| Preparacao para producao | Nao pronto | URLs hardcoded, sem rate limiting, sem logging |

### Metricas do Codigo

| Metrica | Backend | Frontend |
|---------|---------|----------|
| Linhas de codigo | ~2.000 | ~3.500 |
| Arquivos fonte | 8 | 15 |
| Modelos/Entidades | 4 | - |
| Endpoints da API | 22 | - |
| Componentes de pagina | - | 6 |
| Componentes UI reutilizaveis | - | 10 |
| Variaveis de estado (useState) | - | 73+ |
| Cobertura de testes | 0% | 0% |

### Funcionalidades Existentes

**Para Alunos**: Buscar tutores por disciplina, visualizar perfis e avaliacoes, agendar sessoes, participar via Google Meet, avaliar sessoes concluidas, receber notificacoes.

**Para Tutores**: Cadastrar disciplinas com niveis, definir disponibilidade, confirmar/recusar sessoes, acompanhar historico e avaliacoes, receber notificacoes.

**Plataforma**: Autenticacao Google OAuth, eventos automaticos no Google Calendar, links Google Meet, cancelamento automatico de sessoes nao confirmadas, sistema de notificacoes (polling 30s), estatisticas publicas, Termos de Uso e Politica de Privacidade.

---

## Analise de Potencial

### Por que Tutor Connect pode se tornar uma ferramenta essencial

1. **Demanda real**: Mestrandos e doutorandos precisam cumprir horas-aula como requisito obrigatorio dos programas de pos-graduacao. Atualmente nao existe uma plataforma padronizada para gerenciar isso.

2. **Lacuna no mercado**: Plataformas como Preply e Superprof sao comerciais e voltadas para tutoria particular paga. Nao existem ferramentas gratuitas e abertas focadas no contexto academico brasileiro.

3. **Integracao institucional**: A plataforma pode ser adotada por universidades como ferramenta oficial de gestao de monitoria e estagio docente.

4. **Escalabilidade do modelo**: O modelo peer-to-peer (P2P) permite crescimento organico sem custo de contratacao de tutores.

5. **Dados academicos**: Com o tempo, a plataforma pode gerar dados valiosos sobre demanda por disciplinas, eficacia de tutoria e padroes de aprendizagem.

### Diferenciais Competitivos Potenciais

| Aspecto | Tutor Connect | Plataformas Comerciais |
|---------|---------------|----------------------|
| Custo | Gratuito e open source | Pago (comissao por sessao) |
| Foco | Academico (graduacao e pos) | Comercial (tutoria particular) |
| Horas-aula | Controle integrado | Nao oferece |
| Certificados | Geracao automatica (proposto) | Manual |
| Integracao institucional | Possivel via API | Nao disponivel |
| Dados academicos | Dashboards analiticos (proposto) | Limitado |

---

## Novas Funcionalidades Propostas

### Prioridade Alta -- Essenciais para Pos-graduacao

#### 1. Sistema de Controle de Horas-aula

Funcionalidade central para mestrandos e doutorandos que precisam comprovar horas de atividade docente.

- Registro automatico de horas por sessao concluida
- Painel com saldo de horas cumpridas vs. horas obrigatorias
- Configuracao de metas por semestre (ex: 60 horas para mestrado, 120 para doutorado)
- Historico detalhado com filtros por periodo, disciplina e tipo de atividade
- Exportacao de relatorio em PDF para entrega ao programa de pos-graduacao
- Aprovacao de horas pelo orientador ou coordenador do programa

#### 2. Geracao de Certificados e Declaracoes

- Certificado automatico de participacao como tutor (PDF)
- Declaracao de horas-aula cumpridas com assinatura digital
- Certificado para o aluno (comprovante de tutoria recebida)
- Templates personalizaveis por instituicao
- QR Code de verificacao de autenticidade

#### 3. Perfis Academicos Diferenciados

- Nivel academico: graduacao, mestrado, doutorado, pos-doutorado
- Vinculo institucional: universidade, departamento, programa
- Linha de pesquisa e area de concentracao
- Lattes/ORCID integrados ao perfil
- Permissoes diferenciadas por nivel (ex: doutorandos podem orientar mestrandos)

#### 4. Sistema de Disciplinas Institucional

- Catalogo de disciplinas por universidade e departamento
- Codigo da disciplina (ex: MAT001 - Calculo I)
- Ementa e pre-requisitos vinculados
- Mapeamento entre disciplinas de diferentes instituicoes
- Sugestao automatica de tutores baseada na grade curricular do aluno

### Prioridade Media -- Melhorias de Experiencia

#### 5. Chat em Tempo Real

- Mensagens diretas entre aluno e tutor
- Chat vinculado a sessao (historico de conversa por sessao)
- Compartilhamento de arquivos (PDF, imagens, documentos)
- Notificacoes push de novas mensagens
- Historico de conversas pesquisavel

#### 6. Dashboard Analitico

- Para tutores: numero de sessoes, media de avaliacao por disciplina, evolucao temporal
- Para alunos: disciplinas estudadas, horas de tutoria, progresso por disciplina
- Para coordenadores: visao geral do programa, ranking de tutores, demanda por disciplina
- Graficos interativos com filtros por periodo
- Exportacao de dados para analise externa

#### 7. Sistema de Matching Inteligente

- Recomendacao de tutores baseada no historico do aluno
- Matching por compatibilidade de horarios
- Priorizacao por avaliacao e especialidade
- Sugestao de disciplinas baseada na grade curricular
- Notificacao quando um tutor compativel se cadastrar

#### 8. Agenda Avancada

- Visualizacao em formato de calendario (semanal e mensal)
- Sessoes recorrentes (mesma hora toda semana)
- Lembretes automaticos antes da sessao (15min, 1h, 1 dia)
- Sincronizacao bidirecional com Google Calendar
- Deteccao de conflitos de horario entre todas as sessoes do usuario

#### 9. Recursos de Estudo Compartilhados

- Biblioteca de materiais por disciplina (PDFs, links, videos)
- Upload de materiais pelo tutor apos sessao
- Notas colaborativas durante a sessao
- Historico de recursos por sessao
- Sistema de favoritos para materiais uteis

### Prioridade Baixa -- Diferenciacao

#### 10. Gamificacao e Reconhecimento

- Badges por marcos atingidos (10 sessoes, 50 horas, melhor avaliacao)
- Ranking de tutores por disciplina e periodo
- Nivel de experiencia progressivo (Iniciante, Intermediario, Senior, Master)
- Conquistas especiais (primeira sessao, primeira avaliacao 5 estrelas)

#### 11. Suporte Multi-instituicional

- Registro de multiplas universidades no sistema
- Administracao por instituicao (coordenadores, secretarios)
- Personalizacao visual por instituicao (logo, cores)
- Isolamento de dados entre instituicoes (multi-tenancy)

#### 12. Aplicativo Mobile (PWA)

- Progressive Web App para acesso mobile
- Notificacoes push nativas
- Acesso offline ao historico de sessoes
- Camera para scan de QR Code de certificados

#### 13. Integracao com Sistemas Academicos

- API para integracao com sistemas de gestao academica (SIGAA, etc)
- Importacao automatica de grade curricular
- Sincronizacao de disciplinas e turmas
- Single Sign-On (SSO) institucional via SAML/OAuth

#### 14. Sessoes em Grupo

- Tutoria para multiplos alunos simultaneamente
- Sala virtual com capacidade configuravel
- Divisao de horas-aula entre participantes
- Chat em grupo vinculado a sessao

---

## Problemas Identificados

### Problemas Criticos (Correcao Imediata)

#### Backend

| ID | Problema | Localizacao | Impacto |
|----|----------|-------------|---------|
| SEC-001 | Endpoint admin sem autenticacao | `server.js:79` - POST `/admin/cancelar-sessoes-expiradas` | Qualquer pessoa pode disparar cancelamento em massa |
| SEC-002 | Tokens Google armazenados sem criptografia | `auth.js:147-153` | Vazamento de banco expoe tokens do Google |
| SEC-003 | OAuth sem protecao CSRF (sem state parameter) | `auth.js:90-101` | Vulneravel a ataques de OAuth CSRF |
| SEC-004 | CORS hardcoded para localhost | `server.js:18` | Impossivel fazer deploy em producao |
| BUG-001 | Cron job e setInterval executando simultaneamente | `server.js:50,63` | Cancelamento duplicado, desperdicio de recursos |
| BUG-002 | Race condition no calculo de avaliacao | `sessoes.js:498-506` | Media de avaliacao pode ficar incorreta |
| BUG-003 | Timezone quebrado na disponibilidade | `users.js:162-253` | Horarios errados dependendo do fuso |
| BUG-004 | Token Google nunca renovado apos expirar | `cancelamentoAutomaticoService.js:7-17` | Integracao com Calendar para de funcionar |

#### Frontend

| ID | Problema | Localizacao | Impacto |
|----|----------|-------------|---------|
| SEC-005 | Token JWT armazenado em localStorage (XSS) | `App.js:281` | Script malicioso pode roubar o token |
| SEC-006 | URL da API hardcoded em 6 arquivos | Todos os componentes | Impossivel configurar ambientes diferentes |
| BUG-005 | Memory leak nos useEffect sem cleanup | `Dashboard.js:94-112` | Warnings no console, vazamento de memoria |
| BUG-006 | react-scripts com versao invalida (^0.0.0) | `package.json:19` | Build pode falhar |
| BUG-007 | Arquivos Agendamento.js e Avaliacao.js vazios | `src/components/` | Importados mas sem implementacao |
| UX-001 | Sem Error Boundary | Nenhum componente | Erro em um componente derruba o app inteiro |

### Problemas de Alta Prioridade

| ID | Problema | Tipo | Impacto |
|----|----------|------|---------|
| SEC-007 | Sem rate limiting nos endpoints | Seguranca | Vulneravel a forca bruta no login |
| SEC-008 | Sem requisitos de forca de senha | Seguranca | Usuarios podem ter senhas fracas |
| SEC-009 | Regex injection no filtro de disciplinas | Seguranca | Possivel ReDoS attack |
| SEC-010 | Sem validacao de input (nenhuma lib) | Seguranca | Dados malformados aceitos |
| ARCH-001 | Dashboard.js com 1.160 linhas e 26+ useState | Arquitetura | Impossivel manter e testar |
| ARCH-002 | Sem camada de servicos no backend | Arquitetura | Logica de negocios acoplada nas rotas |
| ARCH-003 | Sem gerenciamento de estado (Context/Redux) | Arquitetura | Prop drilling, estados duplicados |
| PERF-001 | Sem paginacao na listagem de tutores | Performance | Carrega todos os tutores de uma vez |
| PERF-002 | Polling de notificacoes mesmo com dropdown fechado | Performance | Requisicoes desnecessarias ao servidor |

### Problemas de Media Prioridade

| ID | Problema | Tipo | Impacto |
|----|----------|------|---------|
| SEC-011 | Sem headers de seguranca (Helmet) | Seguranca | Faltam X-Frame-Options, HSTS, etc |
| SEC-012 | JWT com expiracao de 7 dias sem refresh token | Seguranca | Token roubado vale por 7 dias |
| UX-002 | Sem skeleton loading | UX | Tela branca enquanto carrega |
| UX-003 | Sem debounce na busca | UX | Re-renderiza a cada tecla digitada |
| UX-004 | Sem atualizacao otimista | UX | Usuario espera resposta completa da API |
| UX-005 | Acessibilidade incompleta (aria-labels, nav semantica) | UX | Inacessivel para leitores de tela |
| QUAL-001 | 0% de cobertura de testes | Qualidade | Qualquer mudanca pode quebrar algo |
| QUAL-002 | Sem logging estruturado | Qualidade | Impossivel debugar em producao |

---

## Melhorias Tecnicas Necessarias

### Backend

#### Seguranca

1. Adicionar autenticacao ao endpoint admin (`server.js:79`)
2. Criptografar tokens Google com `crypto` (AES-256)
3. Implementar state parameter no OAuth (protecao CSRF)
4. Mover CORS origin para variavel de ambiente
5. Adicionar rate limiting com `express-rate-limit`
6. Implementar validacao de input com `joi` ou `zod`
7. Adicionar headers de seguranca com `helmet`
8. Validar forca de senha no registro
9. Implementar refresh token para JWT
10. Escapar regex no filtro de disciplinas

#### Arquitetura

1. Criar camada de servicos (separar logica de negocios das rotas)
2. Criar camada de repositorios (separar acesso a dados)
3. Implementar middleware global de tratamento de erros
4. Remover setInterval duplicado (manter apenas cron)
5. Corrigir race condition na avaliacao (usar MongoDB `$group` aggregation)
6. Corrigir tratamento de timezone (usar UTC consistente ou `date-fns`)
7. Implementar renovacao automatica de token Google
8. Adicionar versionamento de API (`/v1/auth`, `/v1/users`)
9. Adicionar endpoint de health check

#### Infraestrutura

1. Configurar logging estruturado com `winston`
2. Adicionar paginacao em todos os endpoints de listagem
3. Implementar cache com Redis para dados frequentes
4. Configurar compressao com `compression` middleware
5. Adicionar testes unitarios e de integracao com `jest` e `supertest`
6. Validar variaveis de ambiente no startup do servidor
7. Documentar API com Swagger/OpenAPI

### Frontend

#### Seguranca

1. Migrar token de localStorage para cookies HttpOnly (requer mudanca no backend)
2. Centralizar URL da API em variavel de ambiente (`REACT_APP_API_URL`)
3. Implementar Error Boundary global

#### Arquitetura

1. Criar Context API para autenticacao (AuthContext)
2. Criar axios instance com interceptors (request e response)
3. Dividir Dashboard.js em subcomponentes:
   - `TutorSearchTab.js`
   - `SessionsTab.js`
   - `TutorCard.js`
   - `SessionCard.js`
   - `BookingModal.js`
   - `EvaluationModal.js`
   - `CancellationModal.js`
4. Implementar React Query para cache e gerenciamento de estado do servidor
5. Criar hooks customizados (`useAuth`, `useNotifications`, `useSessions`)
6. Adicionar cleanup nos useEffect (AbortController)
7. Corrigir versao do react-scripts para `^5.0.0`
8. Remover arquivos vazios (Agendamento.js, Avaliacao.js)

#### UX

1. Implementar skeleton loading nos carregamentos
2. Adicionar debounce na busca de tutores (300ms)
3. Implementar atualizacao otimista nas acoes de sessao
4. Melhorar acessibilidade: aria-labels, `lang="pt-BR"`, navegacao semantica, skip links
5. Adicionar confirmacao antes de acoes destrutivas
6. Adicionar modo escuro (CSS variables ja preparadas)

---

## Arquitetura Alvo

### Estrutura Proposta

```
tutor-connect/
├── backend/
│   ├── src/
│   │   ├── config/               # Configuracoes centralizadas
│   │   │   ├── database.js
│   │   │   ├── env.js            # Validacao de env vars
│   │   │   └── google.js         # Config OAuth/Calendar
│   │   ├── middleware/
│   │   │   ├── auth.js           # Autenticacao JWT
│   │   │   ├── rateLimiter.js    # Rate limiting
│   │   │   ├── validate.js       # Validacao de input
│   │   │   └── errorHandler.js   # Tratamento global de erros
│   │   ├── models/               # Mongoose schemas
│   │   ├── repositories/         # Acesso a dados
│   │   ├── services/             # Logica de negocios
│   │   ├── controllers/          # Handlers de requisicao
│   │   ├── routes/               # Definicao de rotas (somente roteamento)
│   │   ├── helpers/              # Utilitarios
│   │   ├── jobs/                 # Cron jobs
│   │   └── validators/           # Schemas de validacao (Joi/Zod)
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios instance e interceptors
│   │   ├── components/
│   │   │   ├── ui/               # Componentes base (shadcn/ui)
│   │   │   ├── dashboard/        # Subcomponentes do Dashboard
│   │   │   ├── profile/          # Subcomponentes do Profile
│   │   │   └── shared/           # Componentes compartilhados
│   │   ├── contexts/             # React Context providers
│   │   ├── hooks/                # Custom hooks
│   │   ├── pages/                # Componentes de pagina
│   │   ├── lib/                  # Utilitarios
│   │   └── types/                # Definicoes de tipos (se migrar para TS)
│   ├── tests/
│   └── package.json
│
└── docs/
    ├── api/                      # Documentacao Swagger
    ├── architecture/             # Diagramas de arquitetura
    └── deployment/               # Guias de deploy
```

---

## Modelo de Dados Proposto

### Modelos Existentes (Manter com Correcoes)

```
User (existente -- corrigir timezone e adicionar campos)
├── [EXISTENTE] nome, email, senha, bio, localizacao
├── [EXISTENTE] isTutor, profileCompleted
├── [EXISTENTE] disciplinas_dominadas, disciplinas_precisa, disponibilidade
├── [EXISTENTE] rating, total_avaliacoes, total_sessoes
├── [EXISTENTE] googleAccessToken (CRIPTOGRAFAR), googleRefreshToken (CRIPTOGRAFAR)
├── [NOVO] nivel_academico (graduacao | mestrado | doutorado | pos-doutorado)
├── [NOVO] instituicao (ref: Instituicao)
├── [NOVO] programa (ref: Programa)
├── [NOVO] lattes_url, orcid
├── [NOVO] linha_pesquisa, area_concentracao
└── [NOVO] role (aluno | tutor | coordenador | admin)

Sessao (existente -- sem mudancas estruturais)
Avaliacao (existente -- sem mudancas estruturais)
Notificacao (existente -- sem mudancas estruturais)
```

### Novos Modelos

```
Instituicao (NOVO)
├── nome, sigla
├── tipo (publica | privada)
├── logo_url, website
├── programas [ref: Programa]
├── configuracoes {
│     horas_mestrado: Number,
│     horas_doutorado: Number,
│     permite_certificado_automatico: Boolean
│   }
└── data_criacao

Programa (NOVO)
├── instituicao (ref: Instituicao)
├── nome, departamento
├── nivel (graduacao | mestrado | doutorado)
├── disciplinas [ref: Disciplina]
├── horas_aula_obrigatorias
├── coordenador (ref: User)
└── ativo (Boolean)

Disciplina (NOVO)
├── codigo (ex: MAT001)
├── nome, ementa
├── carga_horaria
├── programa (ref: Programa)
├── pre_requisitos [ref: Disciplina]
└── tutores_ativos [ref: User]

RegistroHoras (NOVO)
├── tutor (ref: User)
├── sessao (ref: Sessao)
├── programa (ref: Programa)
├── horas_registradas
├── tipo (tutoria | monitoria | estagio_docencia)
├── status (pendente | aprovado | rejeitado)
├── aprovado_por (ref: User)
├── observacao_aprovador
├── data_registro
└── data_aprovacao

Certificado (NOVO)
├── usuario (ref: User)
├── tipo (tutoria | horas_aula | participacao)
├── programa (ref: Programa)
├── periodo_inicio, periodo_fim
├── total_horas, total_sessoes
├── codigo_verificacao (UUID)
├── assinatura_digital
├── pdf_url
└── data_emissao

Mensagem (NOVO -- para chat)
├── remetente (ref: User)
├── destinatario (ref: User)
├── sessao (ref: Sessao) -- opcional
├── conteudo
├── tipo (texto | arquivo)
├── arquivo_url, arquivo_nome
├── lida
└── data_envio
```

---

## Roadmap de Desenvolvimento

### Fase 0 -- Estabilizacao (Semanas 1-2)

Objetivo: Corrigir problemas criticos de seguranca e bugs.

**Semana 1: Seguranca e bugs criticos**

- [ ] Adicionar autenticacao ao endpoint admin (`server.js:79`)
- [ ] Mover CORS origin para variavel de ambiente
- [ ] Centralizar URL da API do frontend em variavel de ambiente
- [ ] Corrigir versao do react-scripts para `^5.0.0`
- [ ] Remover setInterval duplicado (manter apenas cron)
- [ ] Corrigir race condition na avaliacao (usar MongoDB aggregation)
- [ ] Adicionar Error Boundary global no frontend
- [ ] Remover arquivos vazios (Agendamento.js, Avaliacao.js)

**Semana 2: Seguranca avancada**

- [ ] Implementar state parameter no OAuth (protecao CSRF)
- [ ] Criptografar tokens Google no banco de dados
- [ ] Adicionar rate limiting nos endpoints de autenticacao
- [ ] Implementar validacao de input com Joi ou Zod
- [ ] Adicionar headers de seguranca com Helmet
- [ ] Validar forca de senha no registro
- [ ] Adicionar validacao de variaveis de ambiente no startup
- [ ] Corrigir tratamento de timezone

### Fase 1 -- Fundacao Tecnica (Semanas 3-6)

Objetivo: Refatorar a arquitetura para suportar crescimento.

**Semana 3-4: Refatoracao do backend**

- [x] Criar camada de servicos (extrair logica das rotas)
- [x] Criar camada de repositorios (acesso a dados centralizado)
- [x] Implementar middleware global de tratamento de erros
- [x] Adicionar logging estruturado com Winston
- [x] Implementar paginacao em todos os endpoints de listagem
- [x] Implementar renovacao automatica de token Google
- [x] Documentar API com Swagger/OpenAPI

**Semana 5-6: Refatoracao do frontend**

- [x] Criar Context API para autenticacao (AuthContext)
- [x] Criar axios instance com interceptors
- [x] Dividir Dashboard.js em subcomponentes
- [x] Implementar React Query para cache e gerenciamento de estado
- [x] Criar hooks customizados (useAuth, useNotifications, useSessions)
- [x] Adicionar cleanup nos useEffect (AbortController)
- [x] Implementar skeleton loading e debounce na busca

### Fase 2 -- Testes e Qualidade (Semanas 7-8)

Objetivo: Garantir estabilidade com cobertura de testes.

- [ ] Configurar Jest e Supertest no backend
- [ ] Escrever testes unitarios para todos os servicos
- [ ] Escrever testes de integracao para todos os endpoints
- [ ] Configurar React Testing Library no frontend
- [ ] Escrever testes para fluxos criticos (login, agendamento, avaliacao)
- [ ] Configurar CI/CD com GitHub Actions (lint, test, build)
- [ ] Atingir no minimo 70% de cobertura de testes
- [ ] Adicionar ESLint e Prettier no projeto

### Fase 3 -- Funcionalidades para Pos-graduacao (Semanas 9-14)

Objetivo: Implementar funcionalidades essenciais para mestrandos e doutorandos.

**Semana 9-10: Perfis academicos e institucional**

- [ ] Criar modelo Instituicao e Programa
- [ ] Implementar perfis academicos diferenciados (graduacao, mestrado, doutorado)
- [ ] Adicionar vinculo institucional ao perfil
- [ ] Criar painel de configuracao por programa
- [ ] Implementar cadastro de disciplinas por codigo institucional

**Semana 11-12: Controle de horas-aula**

- [ ] Criar modelo RegistroHoras
- [ ] Implementar registro automatico de horas por sessao concluida
- [ ] Criar painel de acompanhamento de horas (saldo vs obrigatorio)
- [ ] Implementar fluxo de aprovacao de horas pelo coordenador
- [ ] Adicionar exportacao de relatorio em PDF

**Semana 13-14: Certificados e declaracoes**

- [ ] Criar modelo Certificado
- [ ] Implementar geracao de certificados em PDF
- [ ] Adicionar QR Code de verificacao
- [ ] Criar endpoint publico de verificacao de certificado
- [ ] Implementar declaracao de horas-aula cumpridas

### Fase 4 -- Experiencia do Usuario (Semanas 15-20)

Objetivo: Melhorar a experiencia e adicionar funcionalidades de comunicacao.

**Semana 15-16: Chat em tempo real**

- [ ] Implementar WebSocket com Socket.io
- [ ] Criar modelo Mensagem
- [ ] Implementar chat direto entre usuarios
- [ ] Adicionar compartilhamento de arquivos
- [ ] Vincular chat a sessoes

**Semana 17-18: Dashboard analitico**

- [ ] Implementar dashboard para tutores (metricas e graficos)
- [ ] Implementar dashboard para alunos (progresso e historico)
- [ ] Implementar dashboard para coordenadores (visao geral do programa)
- [ ] Adicionar filtros por periodo e disciplina

**Semana 19-20: Agenda avancada e matching**

- [ ] Implementar visualizacao em calendario (semanal/mensal)
- [ ] Adicionar sessoes recorrentes
- [ ] Implementar lembretes automaticos
- [ ] Criar algoritmo de recomendacao de tutores
- [ ] Implementar matching por compatibilidade de horarios

### Fase 5 -- Escala e Integracao (Semanas 21-26)

Objetivo: Preparar para adocao institucional em larga escala.

- [ ] Implementar multi-tenancy (isolamento por instituicao)
- [ ] Criar API publica para integracao com sistemas academicos
- [ ] Implementar SSO institucional (SAML/OAuth)
- [ ] Converter frontend para PWA (Progressive Web App)
- [ ] Implementar sessoes em grupo
- [ ] Adicionar sistema de gamificacao (badges, ranking)
- [ ] Configurar infraestrutura para producao (Docker, Nginx, SSL)
- [ ] Implementar cache com Redis
- [ ] Realizar testes de carga
- [ ] Documentar processo de onboarding institucional

---

## Stack Tecnologica Recomendada

### Pacotes a Adicionar

| Pacote | Proposito | Prioridade |
|--------|-----------|------------|
| `helmet` | Headers de seguranca | Alta |
| `express-rate-limit` | Rate limiting | Alta |
| `joi` ou `zod` | Validacao de input | Alta |
| `winston` | Logging estruturado | Alta |
| `compression` | Compressao gzip | Media |
| `@tanstack/react-query` | Cache e estado do servidor | Alta |
| `react-hook-form` | Formularios eficientes | Media |
| `date-fns` | Manipulacao de datas | Media |
| `socket.io` | Chat em tempo real | Media |
| `jest` + `supertest` | Testes backend | Alta |
| `@testing-library/react` | Testes frontend | Alta |
| `eslint` + `prettier` | Qualidade de codigo | Alta |
| `swagger-jsdoc` | Documentacao de API | Media |
| `pdfkit` ou `puppeteer` | Geracao de certificados PDF | Media |
| `redis` | Cache distribuido | Baixa |
| `bull` ou `agenda` | Filas de jobs | Baixa |

### Estimativa de Esforco por Fase

| Fase | Duracao | Horas Estimadas | Prioridade |
|------|---------|-----------------|------------|
| Fase 0 - Estabilizacao | 2 semanas | 40-50h | Critica |
| Fase 1 - Fundacao Tecnica | 4 semanas | 60-80h | Alta |
| Fase 2 - Testes e Qualidade | 2 semanas | 30-40h | Alta |
| Fase 3 - Pos-graduacao | 6 semanas | 80-120h | Alta |
| Fase 4 - Experiencia | 6 semanas | 80-100h | Media |
| Fase 5 - Escala | 6 semanas | 80-120h | Media |
| **Total** | **26 semanas** | **370-510h** | - |

---

Documento gerado em: Fevereiro de 2026
Baseado na analise completa do codigo fonte (backend ~2.000 linhas, frontend ~3.500 linhas)
