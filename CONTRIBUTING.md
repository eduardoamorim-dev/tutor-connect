# Guia de Contribuição

Obrigado por considerar contribuir com o Tutor Connect! Este guia foi criado para ajudar tanto quem nunca contribuiu com um projeto open source quanto desenvolvedores experientes.

## Sumário

- [Primeiros Passos](#primeiros-passos)
- [Configurando o Ambiente](#configurando-o-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões do Projeto](#padrões-do-projeto)
- [Checklist do Pull Request](#checklist-do-pull-request)
- [Reportando Problemas](#reportando-problemas)
- [Dúvidas Frequentes](#dúvidas-frequentes)

---

## Primeiros Passos

### O que é um Fork?

Um fork é uma cópia do repositório na sua conta do GitHub. Isso permite que você faça alterações sem afetar o projeto original.

### O que é um Pull Request?

Um Pull Request (PR) é uma solicitação para que suas alterações sejam incorporadas ao projeto original. É como dizer: "Fiz essas melhorias, vocês podem revisar e aceitar?"

### O que é uma Issue?

Issues são usadas para reportar bugs, sugerir funcionalidades ou discutir melhorias. Antes de começar a trabalhar em algo, verifique se já existe uma issue relacionada.

---

## Configurando o Ambiente

### 1. Faça um Fork do Repositório

1. Acesse o repositório do Tutor Connect no GitHub
2. Clique no botão "Fork" no canto superior direito
3. Aguarde a cópia ser criada na sua conta

### 2. Clone o Repositório

```bash
# Substitua SEU-USUARIO pelo seu nome de usuário do GitHub
git clone https://github.com/SEU-USUARIO/tutor-connect.git
cd tutor-connect
```

### 3. Configure o Repositório Original como Remote

```bash
# Adiciona o repositório original como "upstream"
git remote add upstream https://github.com/eduardoamorim-dev/tutor-connect.git

# Verifique se foi adicionado corretamente
git remote -v
```

### 4. Instale as Dependências

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no arquivo .env

# Frontend
cd ../frontend
npm install
```

### 5. Execute o Projeto

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## Fluxo de Trabalho

### 1. Mantenha seu Fork Atualizado

Antes de começar qualquer trabalho, sincronize seu fork com o repositório original:

```bash
# Busca as atualizações do repositório original
git fetch upstream

# Muda para a branch main
git checkout main

# Mescla as atualizações
git merge upstream/main

# Envia para o seu fork
git push origin main
```

### 2. Crie uma Branch

Nunca trabalhe diretamente na branch `main`. Sempre crie uma branch específica para sua alteração.

#### Padrão de Nomenclatura

| Tipo                | Formato                       | Exemplo                          |
| ------------------- | ----------------------------- | -------------------------------- |
| Nova funcionalidade | `feat/numero-issue/descricao` | `feat/42/filtro-por-localizacao` |
| Correção de bug     | `fix/numero-issue/descricao`  | `fix/15/erro-login-google`       |
| Documentação        | `docs/descricao`              | `docs/atualizar-readme`          |
| Refatoração         | `refactor/descricao`          | `refactor/componente-sessao`     |
| Testes              | `test/descricao`              | `test/servico-usuario`           |

```bash
# Crie e mude para a nova branch
git checkout -b feat/42/filtro-por-localizacao
```

### 3. Faça suas Alterações

- Faça commits pequenos e frequentes
- Cada commit deve representar uma alteração lógica e completa
- Teste suas alterações antes de commitar

### 4. Padrão de Commits

Utilizamos o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

#### Estrutura

```
tipo(#numero-issue): descrição curta

Corpo do commit (opcional)
- Explique O QUE foi feito
- Explique POR QUE foi necessário
- Explique COMO foi implementado
```

#### Tipos de Commit

| Tipo       | Descrição                      |
| ---------- | ------------------------------ |
| `feat`     | Nova funcionalidade            |
| `fix`      | Correção de bug                |
| `docs`     | Alteração em documentação      |
| `style`    | Formatação (não altera lógica) |
| `refactor` | Refatoração de código          |
| `test`     | Adição ou correção de testes   |
| `chore`    | Tarefas de manutenção          |

#### Exemplos

```bash
# Commit simples
git commit -m "feat(#42): adiciona filtro de tutores por localizacao"

# Commit com corpo explicativo
git commit -m "fix(#15): corrige erro de autenticacao com Google

O token de refresh nao estava sendo atualizado corretamente
quando expirava, causando falha no login.

Solucao: adicionada verificacao de expiracao antes de cada
requisicao a API do Google Calendar."
```

### 5. Envie suas Alterações

```bash
# Envia a branch para o seu fork
git push origin feat/42/filtro-por-localizacao
```

### 6. Abra um Pull Request

1. Acesse seu fork no GitHub
2. Clique em "Compare & pull request"
3. Preencha o título e a descrição seguindo o template
4. Adicione screenshots se houver alterações visuais
5. Solicite revisão de outros contribuidores

---

## Padrões do Projeto

### Estrutura de Código

- **Frontend**: Componentes React em `/frontend/src/components`
- **Backend**: Rotas em `/backend/routes`, modelos em `/backend/models`
- **Estilos**: Utilizamos Tailwind CSS

### Formatação

- Execute o Prettier antes de commitar
- Siga as configurações do ESLint do projeto

```bash
# Frontend
cd frontend
npm run format  # Se configurado
npm run lint

# Backend
cd backend
npm run lint
```

### Boas Práticas

- Mantenha componentes pequenos e focados
- Adicione comentários apenas quando necessário para explicar lógica complexa
- Nomeie variáveis e funções de forma descritiva
- Evite código duplicado

---

## Checklist do Pull Request

Antes de abrir seu PR, verifique:

- [ ] O código está funcionando localmente
- [ ] Todas as funcionalidades relacionadas continuam funcionando
- [ ] Não há erros ou warnings no console do navegador
- [ ] O código foi formatado com Prettier
- [ ] Os testes passam (se existirem)
- [ ] A branch segue o padrão de nomenclatura
- [ ] Os commits seguem o padrão Conventional Commits
- [ ] Alterações visuais incluem screenshots no PR
- [ ] A descrição do PR explica claramente as mudanças

---

## Reportando Problemas

### Antes de Criar uma Issue

1. Verifique se o problema já foi reportado
2. Tente reproduzir o problema em uma instalação limpa
3. Colete informações sobre seu ambiente

### Informações Necessárias

Ao criar uma issue, inclua:

- **Título claro e descritivo**
- **Passos para reproduzir o problema**
  1. Primeiro passo
  2. Segundo passo
  3. ...
- **Comportamento esperado**: O que deveria acontecer
- **Comportamento atual**: O que está acontecendo
- **Screenshots**: Se aplicável
- **Ambiente**:
  - Sistema operacional
  - Navegador e versão
  - Versão do Node.js
  - Versão do MongoDB

### Template de Bug Report

```markdown
## Descrição do Bug

Descreva o problema de forma clara.

## Passos para Reproduzir

1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado

O que deveria acontecer.

## Screenshots

Se aplicável.

## Ambiente

- OS: [ex: Windows 11, macOS 14, Ubuntu 22.04]
- Navegador: [ex: Chrome 120, Firefox 121]
- Node.js: [ex: 18.19.0]
```

---

## Dúvidas Frequentes

### Como atualizo minha branch com as últimas alterações da main?

```bash
git checkout main
git fetch upstream
git merge upstream/main
git checkout sua-branch
git rebase main
```

### Meu PR tem conflitos. O que faço?

```bash
# Atualize a main
git checkout main
git fetch upstream
git merge upstream/main

# Volte para sua branch e faça rebase
git checkout sua-branch
git rebase main

# Resolva os conflitos nos arquivos indicados
# Após resolver cada arquivo:
git add arquivo-resolvido
git rebase --continue

# Force push para atualizar o PR
git push origin sua-branch --force
```

### Como desfaço o último commit?

```bash
# Mantém as alterações nos arquivos
git reset --soft HEAD~1

# Remove as alterações também
git reset --hard HEAD~1
```

### Posso trabalhar em uma issue sem estar atribuído a ela?

Sim, mas é recomendado comentar na issue avisando que você vai trabalhar nela. Isso evita trabalho duplicado.

---

## Precisa de Ajuda?

Se tiver dúvidas:

1. Verifique a documentação do projeto
2. Procure em issues fechadas por problemas similares
3. Abra uma issue com a tag "question"

Agradecemos sua contribuição!
