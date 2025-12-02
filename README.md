# 🍅 ZenFocos API - Pomodoro Task Manager

API RESTful construída com NestJS para gerenciar sessões Pomodoro focadas em tarefas.

## 👨‍💻 Autor

Klésio Nascimento

## 📋 Descrição do Projeto

ZenFocos é uma API para gerenciamento de produtividade utilizando a técnica Pomodoro. A aplicação permite:

- 👤 Autenticação e autorização com JWT
- ✅ Gerenciamento completo de tarefas (CRUD)
- ⏱️ Controle de sessões Pomodoro por tarefa
- 📊 Tracking de pomodoros completados
- 🔄 Auto-atualização de status de tarefas
- 📚 Documentação interativa com Swagger

## 🔗 Links

| Recurso                      | URL                                                          |
| ---------------------------- | ------------------------------------------------------------ |
| **Repositório**              | [github.com/klsio22/zen-focos](https://github.com/klsio22/zen-focos) |
| **API em Produção (Render)** | https://zen-focos.onrender.com                              |
| **Swagger Docs (local)**     | http://localhost:3000/api/docs                               |
| **Swagger Docs (produção)**  | https://zen-focos.onrender.com/api/docs                     |

---

## 📌 Pré-requisitos

- **Node.js** v18.0.0+
- **npm** 9+
- **Docker & Docker Compose** (para MySQL)
- **Git**

---

## 🚀 Instruções de Execução

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
DATABASE_URL="mysql://root:root@localhost:3306/zenfocos_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3000
```

### 4. Configurar Banco de Dados

```bash
# Subir MySQL via Docker
npm run docker:up

# Gerar Prisma Client e aplicar migrations
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Executar a aplicação

```bash
# Modo desenvolvimento (watch mode)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

### 6. Acessar a aplicação

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

---

## 🔐 Variáveis de Ambiente

| Variável       | Descrição              | Exemplo                          |
| -------------- | ---------------------- | -------------------------------- |
| `DATABASE_URL` | URL de conexão MySQL   | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET`   | Chave secreta para JWT | `your-secret-key-min-32-chars`   |
| `NODE_ENV`     | Ambiente de execução   | `development` ou `production`    |
| `PORT`         | Porta do servidor      | `3000`                           |

---

## 📊 Diagrama de Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    USER ||--o{ TASK : has
    USER ||--o{ POMODORO_SESSION : has
    TASK ||--o{ POMODORO_SESSION : has

    USER {
        int id PK
        string email UK
        string password
        string name
        datetime createdAt
        datetime updatedAt
    }

    TASK {
        int id PK
        int userId FK
        string title
        text description
        enum status
        int estimatedPomodoros
        int completedPomodoros
        datetime createdAt
        datetime updatedAt
    }

    POMODORO_SESSION {
        int id PK
        int userId FK
        int taskId FK
        int duration
        datetime startTime
        datetime endTime
        datetime pausedAt
        enum status
        boolean isPaused
        int remainingSeconds
        datetime createdAt
        datetime updatedAt
    }
```

### Entidades

| Entidade            | Descrição                             |
| ------------------- | ------------------------------------- |
| **User**            | Usuário do sistema com autenticação   |
| **Task**            | Tarefa com estimativa de pomodoros    |
| **PomodoroSession** | Sessão de foco vinculada a uma tarefa |

### Status de Task

- `PENDING` - Tarefa pendente
- `IN_PROGRESS` - Em andamento (pelo menos 1 pomodoro completado)
- `COMPLETED` - Concluída (todos pomodoros estimados completados)

### Status de PomodoroSession

- `ACTIVE` - Sessão em andamento
- `COMPLETED` - Sessão finalizada com sucesso
- `CANCELLED` - Sessão cancelada

---

## 📚 Documentação Swagger

A documentação interativa da API está disponível em ambos os ambientes:

**Desenvolvimento (local)**: http://localhost:3000/api/docs
**Produção (Render)**: https://zen-focos.onrender.com/api/docs

A documentação inclui:

- Todos os endpoints disponíveis
- Parâmetros de entrada e saída
- Exemplos de requisições e respostas
- Autenticação JWT integrada

---

## ✅ Checklist de Funcionalidades

### RA1 - Projetar e desenvolver uma API funcional utilizando o framework NestJS

| ID   | Descrição                                             | Status |
| ---- | ----------------------------------------------------- | ------ |
| ID1  | Ambiente configurado com NestJS e arquitetura modular | ✅      |
| ID2  | Lógica de negócio separada em services                | ✅      |
| ID3  | Injeção de dependência configurada com providers      | ✅      |
| ID4  | Rotas HTTP com manipulação de params, query e body    | ✅      |
| ID5  | Tratamento de erros global com exceções NestJS        | ✅      |
| ID6  | DTOs para validação de dados                          | ✅      |
| ID7  | Pipes de validação aplicados globalmente              | ✅      |

### RA2 - Implementar persistência de dados com banco de dados relacional

| ID   | Descrição                                                | Status |
| ---- | -------------------------------------------------------- | ------ |
| ID8  | Modelagem de dados com ERD (User, Task, PomodoroSession) | ✅      |
| ID9  | Conexão com MySQL via Prisma ORM                         | ✅      |
| ID10 | Migrations criadas e aplicadas                           | ✅      |
| ID11 | CRUD completo para Tasks e PomodoroSessions              | ✅      |

### RA3 - Realizar testes automatizados

| ID   | Descrição                                 | Status |
| ---- | ----------------------------------------- | ------ |
| ID12 | Testes automatizados com Jest             | ✅      |
| ID13 | Cobertura de testes para rotas principais | ✅      |

### RA4 - Gerar documentação da API e realizar deploy

| ID   | Descrição                                   | Status |
| ---- | ------------------------------------------- | ------ |
| ID14 | Swagger integrado com documentação completa | ✅      |
| ID15 | Deploy em plataforma de hospedagem na nuvem | ✅      |
| ID16 | API funcional em produção                   | ✅      |
| ID17 | Variáveis de ambiente com ConfigModule      | ✅      |
| ID18 | Versionamento de API (v1)                   | ✅      |

### RA5 - Implementar autenticação, autorização e segurança

| ID   | Descrição                                  | Status |
| ---- | ------------------------------------------ | ------ |
| ID19 | Autenticação JWT configurada               | ✅      |
| ID20 | Controle de acesso com Guards e roles      | ✅      |
| ID21 | Middleware para CORS e logging             | ✅      |
| ID22 | Interceptadores para logging/transformação | ✅      |

### 📊 Resumo de Progresso

| RA                     | Concluído | Total  | Progresso |
| ---------------------- | --------- | ------ | --------- |
| RA1 - NestJS API       | 7         | 7      | 100%      |
| RA2 - Persistência     | 4         | 4      | 100%      |
| RA3 - Testes           | 2         | 2      | 100%      |
| RA4 - Docs & Deploy    | 5         | 5      | 100%      |
| RA5 - Auth & Segurança | 4         | 4      | 100%      |
| **TOTAL**              | **22**    | **22** | **100%**  |

---

## 🚀 Ambientes

### Desenvolvimento (Local)
- **URL**: http://localhost:3000
- **Banco de dados**: MySQL via Docker (localhost:3306)
- **Comando**: `npm run start:dev`
- **Variáveis**: `.env` com DATABASE_URL local

### Produção (Render)
- **URL**: https://zen-focos.onrender.com
- **Banco de dados**: MySQL no Clever Cloud
- **Status**: ✅ Funcional
- **Variáveis**: Configuradas no dashboard do Render

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev      # Iniciar com hot-reload

# Produção
npm run build          # Compilar TypeScript
npm run start:prod     # Rodar build compilado

# Prisma
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Rodar migrations
npm run prisma:studio    # Abrir Prisma Studio

# Docker
npm run docker:up      # Subir MySQL localmente
npm run docker:down    # Parar containers

# Qualidade
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Rodar testes
```

---

## 🔧 Configuração de Ambientes

### Desenvolvimento Local

1. Clone e instale:
```bash
git clone https://github.com/klsio22/zen-focos.git
cd zen-focos
npm install
```

2. Configure `.env` com banco local:
```env
DATABASE_URL="mysql://root:root@localhost:3306/zenfocos_db"
NODE_ENV="development"
PORT=3000
```

3. Suba o Docker e execute:
```bash
npm run docker:up
npx prisma migrate dev
npm run start:dev
```

### Produção no Render + Clever Cloud

A aplicação está **deployada com sucesso** no Render:

**Stack:**
- **Render**: Hospedagem da API (Node.js)
- **Clever Cloud**: Banco MySQL em produção
- **Separação de ambientes**: Variáveis de ambiente diferentes

**Variáveis no Render Dashboard:**
- `DATABASE_URL` - Aponta para MySQL do Clever Cloud (não alterado em `.env` local)
- `JWT_SECRET` - Chave de criptografia
- `NODE_ENV=production`
- `ALLOWED_ORIGINS` - URLs permitidas

**Build & Deploy:**
```bash
# Build Command (Render)
npm install && npx prisma generate && npx prisma migrate deploy && npm run build

# Start Command (Render)
npm run start
```

---

## ✅ Status do Projeto

- ✅ **Desenvolvimento**: Funcionando localmente com Docker MySQL
- ✅ **Produção**: Deployed no Render com banco Clever Cloud
- ✅ **API**: Acessível em https://zen-focos.onrender.com
- ✅ **Banco de Dados**: Separado por ambiente (local vs Clever Cloud)
- ✅ **Testes**: 75 testes passando
- ✅ **Documentação**: Swagger disponível em ambos os ambientes

---

## 📄 Licença

UNLICENSED - Projeto acadêmico

---

**Desenvolvido como projeto acadêmico - UTFPR**