# ZenFocos API - Guia de Início Rápido

## 🚀 Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- npm ou yarn

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o banco de dados MySQL

```bash
npm run docker:up
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.

### 4. Gerar cliente Prisma e executar migrações

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Iniciar a aplicação

```bash
npm run start:dev
```

## 📚 Documentação da API

Acesse a documentação Swagger em:
- **URL**: http://localhost:3000/api/docs

## 🔑 Autenticação

Todos os endpoints (exceto `/auth/register` e `/auth/login`) requerem autenticação JWT.

### Registrar novo usuário

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-11-24T10:00:00.000Z",
    "updatedAt": "2024-11-24T10:00:00.000Z"
  }
}
```

### Usar o token

Adicione o header `Authorization` em todas as requisições:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Endpoints da API (v1)

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login de usuário

### Tarefas
- `GET /v1/tasks` - Listar todas as tarefas
- `GET /v1/tasks/grouped` - Tarefas agrupadas por status
- `GET /v1/tasks/:id` - Buscar tarefa por ID
- `POST /v1/tasks` - Criar nova tarefa
- `PUT /v1/tasks/:id` - Atualizar tarefa
- `DELETE /v1/tasks/:id` - Deletar tarefa

### Sessões Pomodoro
- `POST /v1/pomodoro/tasks/:taskId/start-session` - Iniciar nova sessão
- `POST /v1/pomodoro/sessions/:sessionId/pause` - Pausar sessão
- `POST /v1/pomodoro/sessions/:sessionId/resume` - Retomar sessão
- `POST /v1/pomodoro/sessions/:sessionId/complete` - Completar sessão
- `POST /v1/pomodoro/sessions/:sessionId/cancel` - Cancelar sessão
- `GET /v1/pomodoro/sessions` - List all pomodoro sessions for the user

## 🗄️ Scripts Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar nova migração
npm run prisma:migrate

# Abrir Prisma Studio (GUI do banco)
npm run prisma:studio

# Resetar banco de dados
npm run prisma:reset
```

## 🐳 Scripts Docker

```bash
# Iniciar banco de dados
npm run docker:up

# Parar banco de dados
npm run docker:down
```

## 🛠️ Desenvolvimento

```bash
# Modo desenvolvimento com hot-reload
npm run start:dev

# Modo debug
npm run start:debug

# Build para produção
npm run build
npm run start:prod
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📊 Estrutura do Banco de Dados

### User
- id (Int, PK)
- email (String, Unique)
- password (String, Hashed)
- name (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

### Task
- id (Int, PK)
- userId (Int, FK → User)
- title (String)
- description (Text, Optional)
- status (Enum: PENDING, IN_PROGRESS, COMPLETED)
- estimatedPomodoros (Int)
- completedPomodoros (Int)
- createdAt (DateTime)
- updatedAt (DateTime)

### PomodoroSession
- id (Int, PK)
- userId (Int, FK → User)
- taskId (Int, FK → Task)
- duration (Int, default: 25)
- startTime (DateTime)
- endTime (DateTime, Optional)
- status (Enum: ACTIVE, COMPLETED, CANCELLED)
- isPaused (Boolean)
- remainingSeconds (Int, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

## 🔒 Segurança

- Senhas são criptografadas com bcrypt (12 rounds)
- Tokens JWT expiram em 1 dia
- Validação de dados com class-validator
- CORS habilitado

## 🌟 Funcionalidades

- ✅ Autenticação JWT completa
- ✅ CRUD de tarefas com validação
- ✅ Gerenciamento de sessões Pomodoro
- ✅ Pausar/retomar sessões
- ✅ Auto-atualização de status de tarefas
- ✅ Documentação Swagger interativa
- ✅ Versionamento de API (v1)
- ✅ Validação global de DTOs
- ✅ Banco de dados MySQL com Prisma ORM

## 📝 Licença

UNLICENSED
