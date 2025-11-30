<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# 🍅 ZenFocos API - Pomodoro Task Manager

API RESTful construída com NestJS para gerenciar sessões Pomodoro focadas em tarefas. A API permite criar e gerenciar tasks, iniciar/pausar/completar sessões de pomodoro e acompanhar produtividade.

## 👨‍💻 Autor
**Seu Nome Completo** _(substituir pelo nome do estudante)_

## 🔗 Links
- **Repositório**: [github.com/klsio22/zen-focos](https://github.com/klsio22/zen-focos)
- **Produção**: _A ser configurado após deploy_
- **Swagger Docs**: `http://localhost:3000/api/docs` (local)

## 📋 Descrição do Projeto
ZenFocos é uma API completa para gerenciamento de produtividade utilizando a técnica Pomodoro. A aplicação permite:

- 👤 Autenticação e autorização com JWT
- ✅ Gerenciamento completo de tarefas (CRUD)
- ⏱️ Controle de sessões Pomodoro por tarefa
- 📊 Tracking de pomodoros completados
- 🔄 Auto-atualização de status de tarefas
- 📚 Documentação interativa com Swagger

## 🏗️ Arquitetura e Stack

### Backend Framework
- **NestJS v11** - Framework modular e escalável
- **TypeScript 5.7** - Tipagem estática

### Banco de Dados
- **MySQL 8.0** - Banco relacional via Docker
- **Prisma ORM v6** - Type-safe database client

### Autenticação & Segurança
- **JWT (JSON Web Tokens)** - Autenticação stateless
- **Passport.js** - Middleware de autenticação
- **bcrypt** - Hash de senhas (12 rounds)

### Validação & Documentação
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de dados
- **Swagger/OpenAPI** - Documentação interativa da API

### Versionamento
- **URI-based versioning** - `/v1/*` endpoints

## 📌 Pré-requisitos
- **Node.js** v20.19+, v22.12+ ou v24.0+
- **npm** 9+
- **Docker & Docker Compose** (para MySQL)
- **Git**

## 🚀 Instalação e Configuração

### 1. Clonar repositório
```bash
git clone https://github.com/klsio22/zen-focos.git
cd zen-focos
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
DATABASE_URL="mysql://zenfocos:zenfocos123@localhost:3306/zenfocos_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3000
```

### 4. Subir o MySQL via Docker
```bash
npm run docker:up
```

### 5. Criar usuário MySQL com acesso remoto
```bash
docker exec -it prisma_mysql mysql -uroot -proot -e "CREATE USER IF NOT EXISTS 'zenfocos'@'%' IDENTIFIED BY 'zenfocos123'; GRANT ALL PRIVILEGES ON zenfocos_db.* TO 'zenfocos'@'%'; GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'zenfocos'@'%'; FLUSH PRIVILEGES;"
```

### 6. Gerar Prisma Client e aplicar migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 7. Iniciar aplicação
```bash
# Modo desenvolvimento (watch mode)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

### 8. Acessar a aplicação
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Chave secreta para JWT | `your-secret-key-min-32-chars` |
| `NODE_ENV` | Ambiente de execução | `development` ou `production` |
| `PORT` | Porta do servidor | `3000` |

## 📊 Modelo de Dados (ERD)

### Entidades Implementadas

**User** (Usuário)
- `id`: Int (PK, auto-increment)
- `email`: String (unique)
- `password`: String (hashed com bcrypt)
- `name`: String? (opcional)
- `createdAt`, `updatedAt`: DateTime
- **Relações**: hasMany Task, hasMany PomodoroSession

**Task** (Tarefa)
- `id`: Int (PK)
- `userId`: Int (FK → User)
- `title`: String
- `description`: Text? (opcional)
- `status`: Enum (PENDING | IN_PROGRESS | COMPLETED)
- `estimatedPomodoros`: Int (default: 1)
- `completedPomodoros`: Int (default: 0)
- `createdAt`, `updatedAt`: DateTime
- **Relações**: belongsTo User, hasMany PomodoroSession

**PomodoroSession** (Sessão Pomodoro)
- `id`: Int (PK)
- `userId`: Int (FK → User)
- `taskId`: Int (FK → Task)
- `duration`: Int (default: 25 minutos)
- `startTime`: DateTime
- `endTime`: DateTime? (opcional)
- `status`: Enum (ACTIVE | COMPLETED | CANCELLED)
- `isPaused`: Boolean (default: false)
- `remainingSeconds`: Int? (para pausas)
- `createdAt`, `updatedAt`: DateTime
- **Relações**: belongsTo User, belongsTo Task

## 🔎 Endpoints da API

### 🔐 Autenticação (Sem versão)

#### POST `/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "João Silva"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "João Silva",
  "createdAt": "2025-11-26T00:00:00.000Z",
  "updatedAt": "2025-11-26T00:00:00.000Z"
}
```

#### POST `/auth/login`
Autenticar usuário e obter JWT token

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "João Silva"
  }
}
```

---

### ✅ Tasks (v1) - Protegido com JWT

**Todas as rotas requerem header:**
```
Authorization: Bearer {token}
```

#### GET `/v1/tasks`
Listar todas as tarefas do usuário autenticado

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Estudar NestJS",
    "description": "Revisar módulos e controllers",
    "status": "IN_PROGRESS",
    "estimatedPomodoros": 4,
    "completedPomodoros": 2,
    "createdAt": "2025-11-26T00:00:00.000Z",
    "updatedAt": "2025-11-26T01:00:00.000Z"
  }
]
```

#### GET `/v1/tasks/grouped`
Listar tarefas agrupadas por status

**Response:** `200 OK`
```json
{
  "pending": [...],
  "inProgress": [...],
  "completed": [...]
}
```

#### GET `/v1/tasks/:id`
Buscar tarefa específica por ID

**Response:** `200 OK` ou `404 Not Found`

#### POST `/v1/tasks`
Criar nova tarefa

**Body:**
```json
{
  "title": "Estudar Prisma",
  "description": "Aprender sobre migrations e queries",
  "estimatedPomodoros": 3
}
```

**Response:** `201 Created`

#### PUT `/v1/tasks/:id`
Atualizar tarefa completa

**Body:**
```json
{
  "title": "Estudar Prisma - Atualizado",
  "description": "Incluir relacionamentos",
  "status": "IN_PROGRESS",
  "estimatedPomodoros": 4
}
```

**Response:** `200 OK`

#### DELETE `/v1/tasks/:id`
Deletar tarefa

**Response:** `200 OK`

---

### ⏱️ Pomodoro Sessions (v1) - Protegido com JWT

#### POST `/v1/pomodoro/tasks/:taskId/start-session`
Iniciar nova sessão pomodoro para uma tarefa
- Cancela automaticamente sessões ativas anteriores
- Cria nova sessão com 25 minutos de duração

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": 1,
  "taskId": 1,
  "duration": 25,
  "startTime": "2025-11-26T10:00:00.000Z",
  "status": "ACTIVE",
  "isPaused": false,
  "task": { ... }
}
```

#### POST `/v1/pomodoro/sessions/:sessionId/pause`
Pausar sessão ativa

**Body:**
```json
{
  "remainingSeconds": 900
}
```

**Response:** `200 OK`

#### POST `/v1/pomodoro/sessions/:sessionId/resume`
Retomar sessão pausada

**Body:**
```json
{
  "remainingSeconds": 900
}
```

**Response:** `200 OK`

#### POST `/v1/pomodoro/sessions/:sessionId/complete`
Completar sessão pomodoro
- Atualiza `completedPomodoros` da task
- Auto-atualiza status da task se necessário

**Response:** `200 OK`
```json
{
  "session": { ... },
  "completedPomodoros": 3
}
```

#### POST `/v1/pomodoro/sessions/:sessionId/cancel`
Cancelar sessão pomodoro

**Response:** `200 OK`

#### GET `/v1/pomodoro/sessions`
List all pomodoro sessions for the authenticated user (newest first).

**Response:** `200 OK`
```json
[
  { /* session object with task relation */ },
  { /* older session */ }
]
```

## ✨ O que foi implementado

### ✅ Funcionalidades Completas

- [x] **Autenticação JWT completa**
  - Registro de usuários com hash bcrypt
  - Login com geração de token JWT
  - Guards de proteção em rotas
  
- [x] **CRUD de Tasks**
  - Criar, listar, buscar, atualizar e deletar tarefas
  - Auto-atualização de status baseado em pomodoros
  - Listagem agrupada por status
  - Validação completa com DTOs
  
- [x] **Gerenciamento de Sessões Pomodoro**
  - Iniciar sessão vinculada a tarefa
  - Pausar e retomar sessões
  - Completar sessão (incrementa contador da task)
  - Cancelar sessão
  - Buscar sessão ativa/pausada
  - Cancelamento automático de sessões anteriores
  
- [x] **Infraestrutura**
  - Versionamento de API (v1)
  - Documentação Swagger completa
  - Validação global com class-validator
  - Docker Compose para MySQL
  - Prisma ORM v6 com migrations
  - TypeScript strict mode
  - ESLint + Prettier

### 🔄 Regras de Negócio Implementadas

1. **Auto-update de Task Status:**
   - `PENDING` → `IN_PROGRESS` quando primeiro pomodoro é completado
   - `IN_PROGRESS` → `COMPLETED` quando `completedPomodoros >= estimatedPomodoros`
   - `COMPLETED` → `IN_PROGRESS` se novos pomodoros forem adicionados

2. **Sessões Pomodoro:**
   - Apenas uma sessão ativa por usuário por vez
   - Sessões pausadas mantêm `remainingSeconds`
   - Completar sessão incrementa `completedPomodoros` da task

3. **Segurança:**
   - Senhas com hash bcrypt (12 rounds)
   - JWT com expiração de 1 dia
   - Validação de ownership (usuário só acessa seus próprios dados)

## 🧪 Testando a API

### Com Swagger UI
Acesse `http://localhost:3000/api/docs` e teste interativamente.

### Com REST Client (VS Code)
Use o arquivo `api-testes/api-routes.http`:

1. Registre um usuário
2. Faça login e copie o `access_token`
3. Use o token nas rotas protegidas

### Com cURL

```bash
# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123","name":"Teste"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"senha123"}'

# Listar tasks (substitua {TOKEN})
curl -X GET http://localhost:3000/v1/tasks \
  -H "Authorization: Bearer {TOKEN}"
```


## ✅ Checklist de Funcionalidades (RA / ID)

### RA1 - Projetar e desenvolver uma API funcional utilizando o framework NestJS

- [x] **ID1**: Ambiente de desenvolvimento configurado e API criada com NestJS, com rotas e controladores seguindo arquitetura modular
- [x] **ID2**: Boas práticas de organização aplicadas - services contêm lógica de negócio, controladores delegam para services
- [x] **ID3**: Providers configurados com injeção de dependência (PrismaService, TasksService, AuthService, PomodoroSessionsService)
- [x] **ID4**: Rotas HTTP criadas e manipuladas corretamente (params, query, body) em todos os módulos
- [x] **ID5**: Tratamento de erros com exceções NestJS (NotFoundException, BadRequestException, UnauthorizedException)
- [x] **ID6**: DTOs criados para validação (LoginDto, RegisterDto, CreateTaskDto, UpdateTaskDto, PauseSessionDto, ResumeSessionDto)
- [x] **ID7**: Pipes de validação aplicados globalmente com class-validator (whitelist, forbidNonWhitelisted, transform)

### RA2 - Implementar persistência de dados com banco de dados relacional

- [x] **ID8**: Dados modelados corretamente com 3 entidades (User, Task, PomodoroSession), relações e enums definidos em schema Prisma
- [x] **ID9**: API conectada a MySQL 8.0 via Prisma ORM v6 com configuração de datasource
- [x] **ID10**: Migrations criadas e aplicadas para garantir consistência de schema
- [x] **ID11**: Operações CRUD implementadas para Tasks e PomodoroSessions com todos métodos (Create, Read, Update, Delete)

### RA3 - Realizar testes automatizados

- [ ] **ID12**: Testes automatizados não implementados ainda (unitários ou integração com Jest)
- [ ] **ID13**: Cobertura de testes não configurada

### RA4 - Gerar documentação da API e realizar deploy

- [x] **ID14**: Swagger integrado com documentação completa e interativa dos endpoints, DTOs, respostas e exemplos
- [ ] **ID15**: Deploy não realizado (pendente escolha de plataforma: Render, Vercel, Railway, etc.)
- [ ] **ID16**: Funcionalidade em produção não testada
- [x] **ID17**: Variáveis de ambiente configuradas com ConfigModule do NestJS (global)
- [x] **ID18**: Versionamento de API implementado com URI versioning (v1)

### RA5 - Implementar autenticação, autorização e segurança

- [x] **ID19**: Autenticação JWT configurada com Passport.js e geração de tokens
- [ ] **ID20**: Controle de acesso baseado em roles **NÃO implementado** (todos usuários têm mesmo nível)
- [ ] **ID21**: Middleware customizado **NÃO implementado** (usa apenas Guards)
- [ ] **ID22**: Interceptadores **NÃO implementados** (sem logging ou transformação de resposta customizada)

### 📊 Resumo de Progresso

| Resultado de Aprendizagem | Concluído | Parcial | Pendente | Total |
|---------------------------|-----------|---------|----------|-------|
| **RA1** - NestJS API | 7/7 | - | - | 100% |
| **RA2** - Persistência | 4/4 | - | - | 100% |
| **RA3** - Testes | 0/2 | - | 2/2 | 0% |
| **RA4** - Docs & Deploy | 3/5 | - | 2/5 | 60% |
| **RA5** - Auth & Segurança | 1/4 | - | 3/4 | 25% |
| **TOTAL GERAL** | **15/22** | **0** | **7/22** | **68%** |

## 📦 Estrutura do Projeto

```
zen-focos/
├── prisma/
│   ├── schema.prisma          # Schema do Prisma com modelos User, Task, PomodoroSession
│   └── migrations/            # Migrations do banco de dados
├── generated/
│   └── prisma/                # Prisma Client gerado (gitignored)
├── src/
│   ├── main.ts                # Bootstrap da aplicação (Swagger, CORS, Validação Global)
│   ├── app.module.ts          # Módulo raiz
│   ├── app.controller.ts      # Controller raiz (/)
│   ├── app.service.ts         # Service raiz
│   ├── auth/                  # 🔐 Módulo de Autenticação
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts # POST /auth/register, /auth/login
│   │   ├── auth.service.ts    # Lógica de registro, login e validação
│   │   ├── jwt.strategy.ts    # Estratégia Passport JWT
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts  # Guard de proteção JWT
│   ├── prisma/                # 🗄️ Módulo Prisma (Global)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts  # Service Prisma Client
│   ├── tasks/                 # ✅ Módulo de Tarefas
│   │   ├── tasks.module.ts
│   │   ├── tasks.controller.ts    # GET/POST/PUT/DELETE /v1/tasks
│   │   ├── tasks.service.ts       # CRUD + auto-update de status
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts
│   │   │   └── update-task.dto.ts
│   │   └── interfaces/
│   │       └── task.interface.ts
│   ├── pomodoro-sessions/     # ⏱️ Módulo de Sessões Pomodoro
│   │   ├── pomodoro-sessions.module.ts
│   │   ├── pomodoro-sessions.controller.ts  # POST /v1/pomodoro/...
│   │   ├── pomodoro-sessions.service.ts     # Gerenciamento de sessões
│   │   ├── dto/
│   │   │   ├── pause-session.dto.ts
│   │   │   └── resume-session.dto.ts
│   │   └── interfaces/
│   │       └── pomodoro-session.interface.ts
│   ├── pomodoro-breaks/       # ⚠️ NÃO IMPLEMENTADO (placeholder)
│   └── shared/                # Módulo compartilhado (vazio)
├── api-testes/
│   └── api-routes.http        # Arquivo REST Client para testes
├── docker-compose.yml         # MySQL 8.0 container
├── .env                       # Variáveis de ambiente
├── .env.example               # Exemplo de variáveis
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── nest-cli.json              # Configuração NestJS CLI
└── README.md                  # Este arquivo

```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run start          # Iniciar (modo normal)
npm run start:dev      # Iniciar (watch mode)
npm run start:debug    # Iniciar (debug mode)

# Build e Produção
npm run build          # Compilar TypeScript + copiar Prisma Client para dist
npm run start:prod     # Rodar build compilado

# Qualidade de Código
npm run lint           # Executar ESLint com fix automático
npm run format         # Formatar código com Prettier

# Testes (não implementados)
npm run test           # Testes unitários
npm run test:watch     # Testes em watch mode
npm run test:cov       # Cobertura de testes
npm run test:e2e       # Testes end-to-end

# Prisma
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Rodar migrations em dev
npm run prisma:studio    # Abrir Prisma Studio (GUI)
npm run prisma:reset     # Resetar banco de dados

# Docker
npm run docker:up      # Subir MySQL container
npm run docker:down    # Parar e remover containers
```

## 🚀 Próximos Passos

### Funcionalidades Pendentes

1. **Testes Automatizados (Crítico - RA3)**
   - [ ] Configurar Jest para testes unitários
   - [ ] Criar testes para AuthService
   - [ ] Criar testes para TasksService
   - [ ] Criar testes para PomodoroSessionsService
   - [ ] Implementar testes E2E com Supertest
   - [ ] Configurar CI/CD com testes

2. **Deploy em Produção (RA4)**
   - [ ] Escolher plataforma (sugestões: Railway, Render, Fly.io)
   - [ ] Configurar banco MySQL gerenciado (PlanetScale, Railway, etc.)
   - [ ] Configurar variáveis de ambiente na plataforma
   - [ ] Testar migrations em produção
   - [ ] Validar Swagger em produção

3. **Roles e Permissões (RA5)**
   - [ ] Adicionar campo `role` no modelo User (ADMIN, USER)
   - [ ] Criar RolesGuard customizado
   - [ ] Implementar decorador @Roles()
   - [ ] Proteger rotas administrativas

4. **Middleware e Interceptadores (RA5)**
   - [ ] Criar LoggerMiddleware para logging de requisições
   - [ ] Implementar TransformInterceptor para padronizar respostas
   - [ ] Adicionar LoggingInterceptor para métricas

5. **Melhorias Técnicas**
   - [ ] Implementar paginação em GET /v1/tasks
   - [ ] Adicionar filtros e ordenação em listagens
   - [ ] Implementar soft delete para tasks
   - [ ] Adicionar campo `priority` em tasks
   - [ ] Criar endpoint de estatísticas do usuário

## 📝 Notas Técnicas

### Prisma v6 com Client Gerado

Este projeto usa Prisma v6 com cliente gerado em `./generated/prisma`. O script de build copia automaticamente o client para `dist/generated/` para funcionamento em produção.

**Comandos importantes:**
```bash
# Após qualquer alteração no schema.prisma:
npx prisma generate        # Gera o client TypeScript
npx prisma migrate dev     # Cria e aplica migration

# Para visualizar dados:
npx prisma studio         # Abre GUI em http://localhost:5555
```

### Problemas Conhecidos e Soluções

**Erro "Cannot find module '../../generated/prisma/index.js'"**
- Solução: Rodar `npm run build` antes de `npm run start:prod`
- O script de build copia `generated/prisma/` para `dist/generated/`

**Erro "Host not allowed to connect to MySQL server"**
- Solução: Criar usuário MySQL com acesso remoto (ver seção de instalação)

**TypeScript não reconhece tipos do Prisma**
- Solução: Rodar `npx prisma generate` e reiniciar TypeScript server no VS Code

### Segurança

- Senhas armazenadas com **bcrypt** (12 rounds)
- Tokens JWT com expiração de **1 dia**
- Validação global de inputs com **class-validator**
- CORS habilitado (configurar origins em produção)
- **TODO**: Rate limiting, helmet, CSRF protection

## 📄 Licença

UNLICENSED - Projeto acadêmico

## 👥 Contribuindo

Este é um projeto acadêmico. Para sugestões ou melhorias, abra uma issue ou pull request.

---

**Desenvolvido como projeto acadêmico - UTFPR**