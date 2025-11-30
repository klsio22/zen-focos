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

| Recurso                  | URL                                                          |
| ------------------------ | ------------------------------------------------------------ |
| **Repositório**          | [github.com/klsio22/zen-focos](https://github.com/klsio22/zen-focos) |
| **API em Produção**      | _A ser configurado após deploy_                              |
| **Swagger Docs (local)** | http://localhost:3000/api/docs                               |

---

## 📌 Pré-requisitos

- **Node.js** v20.19+, v22.12+ ou v24.0+
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
DATABASE_URL="mysql://zenfocos:zenfocos123@localhost:3306/zenfocos_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3000
```

### 4. Configurar Banco de Dados

```bash
# Subir MySQL via Docker
npm run docker:up

# Criar usuário MySQL com permissões
docker exec -it prisma_mysql mysql -uroot -proot -e "CREATE USER IF NOT EXISTS 'zenfocos'@'%' IDENTIFIED BY 'zenfocos123'; GRANT ALL PRIVILEGES ON zenfocos_db.* TO 'zenfocos'@'%'; GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'zenfocos'@'%'; FLUSH PRIVILEGES;"

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

A documentação interativa da API está disponível em:

**URL**: http://localhost:3000/api/docs

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

## 🚀 Deploy para Produção (Render)

### Método 1: Script Automatizado (Recomendado)

Execute o script de deploy que automatiza o processo:

```bash
./deploy-render.sh
```

### Método 2: Configuração Manual

#### 1. Preparar Banco de Dados Externo

**Opção A - PlanetScale (Recomendado):**
```bash
# 1. Acesse https://planetscale.com e crie uma conta
# 2. Crie um novo database
# 3. Copie a connection string no formato:
# mysql://usuario:senha@host.psdb.cloud/database?sslaccept=strict
```

**Opção B - Railway:**
```bash
# 1. Acesse https://railway.app 
# 2. Crie um MySQL database
# 3. Copie a connection string
```

#### 2. Configurar Render

1. **Acesse [Render](https://render.com)** e faça login
2. **Clique em "New +" > "Web Service"**
3. **Conecte seu repositório GitHub**
4. **Configure os campos:**

| Campo | Valor |
|-------|--------|
| **Name** | `zen-focos` |
| **Runtime** | `Docker` |
| **Branch** | `main` |
| **Region** | `Oregon (US West)` |
| **Instance Type** | `Free` |

#### 3. Comandos de Build e Deploy

| Comando | Valor |
|---------|-------|
| **Build Command** | `npm ci && npx prisma generate && npm run build` |
| **Pre-Deploy Command** | `npx prisma migrate deploy` |
| **Start Command** | `npm run start:prod` |

#### 4. Variáveis de Ambiente

Configure no Render Dashboard:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=seu-jwt-secret-super-seguro-min-32-caracteres
DATABASE_URL=mysql://usuario:senha@host:3306/database
```

#### 5. Deploy

- Clique em **"Create Web Service"**
- Aguarde o build e deploy
- API estará disponível em: `https://zen-focos.onrender.com`

### Verificação do Deploy

Após o deploy, teste os endpoints principais:

```bash
# Health check
curl https://zen-focos.onrender.com/

# Swagger docs
curl https://zen-focos.onrender.com/api/docs

# Criar usuário
curl -X POST https://zen-focos.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'
```

### Estrutura de Deploy

```
zen-focos/
├── Dockerfile              # Container configuration
├── render.yaml             # Render service config
├── deploy-render.sh        # Automated deploy script
├── .dockerignore           # Docker ignore patterns
└── package.json            # Updated build scripts
```

### Troubleshooting Deploy

**Problema: Database connection error**
```bash
# Verificar se DATABASE_URL está correto
# Garantir que o banco externo está acessível
# Confirmar que Pre-Deploy Command está configurado
```

**Problema: Build timeout**
```bash
# Verificar se Build Command não inclui migrations
# Separar build de migrations usando Pre-Deploy Command
```

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
npm run docker:up      # Subir MySQL
npm run docker:down    # Parar containers

# Deploy
npm run render:build      # Build para Render
npm run render:predeploy  # Migrations para Render
./deploy-render.sh        # Script automatizado de deploy

# Qualidade
npm run lint           # ESLint
npm run format         # Prettier
```

---

## 📄 Licença

UNLICENSED - Projeto acadêmico

---

**Desenvolvido como projeto acadêmico - UTFPR**