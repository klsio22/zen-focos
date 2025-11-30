# 🍅 ZenFocos API - Pomodoro por Task

## 👨‍💻 Autor
**Seu Nome Completo**

## 📋 Descrição do Projeto
ZenFocos é uma API RESTful para gerenciamento da técnica Pomodoro com foco em tarefas específicas. A aplicação permite criar tasks, iniciar sessões de foco, controlar intervalos e gerar relatórios de produtividade.

**URL em Produção:** `https://zenfocos-api.example.com` (substituir pelo link real)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL 12+
- Redis (opcional para cache)

### Instalação
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/zenfocos-api.git
cd zenfocos-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Configuração do Banco de Dados
```bash
# Criar banco de dados
createdb zenfocos_db

# Executar migrações
npx prisma migrate dev

# Popular dados iniciais (opcional)
npx prisma db seed
```

### Variáveis de Ambiente (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zenfocos_db"
JWT_SECRET="seu-jwt-secret-super-seguro"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development
```

### Execução
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📊 Diagrama de Entidade-Relacionamento

```mermaid
erDiagram
    TASK ||--o{ POMODORO_SESSION : has
    POMODORO_SESSION ||--o{ POMODORO_BREAK : contains

    %% Local mode: no users. Entities simplified for local/in-memory usage.

    TASK {
        string id
        string title
        text description
        string status
        integer estimated_pomodoros
        integer completed_pomodoros
        datetime created_at
        datetime updated_at
    }

    POMODORO_SESSION {
        string id
        string task_id
        integer duration
        datetime start_time
        datetime end_time
        string status
    }

    POMODORO_BREAK {
        string id
        string session_id
        integer duration
        datetime start_time
        datetime end_time
        string type
    }
```

## 📚 Documentação da API

**Swagger UI:** `https://zenfocos-api.example.com/api/docs`

Endpoints principais (local mode):
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a task
- `GET /tasks/:id` - Get task by id
- `PUT /tasks/:id` - Replace task
- `PATCH /tasks/:id` - Update task fields
- `PATCH /tasks/:id/complete-pomodoro` - Increment completed pomodoros for a task
- `DELETE /tasks/:id` - Delete a task
- `POST /pomodoro-sessions` - Start a pomodoro session
- `GET /pomodoro-sessions` - List sessions
- `GET /pomodoro-sessions/active` - Get active session
- `GET /pomodoro-sessions/active/remaining` - Remaining time for active session
- `GET /pomodoro-sessions/:id` - Get session by id
- `GET /pomodoro-sessions/:id/remaining` - Remaining time for a session
- `POST /pomodoro-sessions/:id/complete` - Mark session complete
- `POST /pomodoro-sessions/:id/cancel` - Cancel session
- `POST /pomodoro-sessions/:id/advance` - Complete session and start break
- `GET /pomodoro-breaks` - List all breaks
- `POST /pomodoro-breaks` - Create break manually
- `GET /pomodoro-breaks/:id` - Get break by id
- `POST /pomodoro-breaks/:id/start` - Start a break
- `POST /pomodoro-breaks/:id/complete` - Complete a break
- `DELETE /pomodoro-breaks/:id` - Delete a break

## ✅ Checklist de Funcionalidades

### RA1 - Projetar e desenvolver API com NestJS
- [x] **ID1**: Ambiente configurado com NestJS e arquitetura modular
- [x] **ID2**: Lógica de negócio separada em services
- [x] **ID3**: Injeção de dependência implementada
- [x] **ID4**: Rotas HTTP com parâmetros corretos
- [x] **ID5**: Tratamento de erros global
- [x] **ID6**: DTOs para validação de dados
- [x] **ID7**: Pipes de validação aplicados

### RA2 - Persistência com banco relacional
- [x] **ID8**: Modelagem de dados com ERD
- [x] **ID9**: Conexão com PostgreSQL via Prisma
- [x] **ID10**: Migrações implementadas
- [x] **ID11**: CRUD completo para Tasks e PomodoroSessions

### RA3 - Testes automatizados
- [x] **ID12**: Testes com Jest implementados
- [x] **ID13**: Cobertura de testes para rotas principais

### RA4 - Documentação e Deploy
- [x] **ID14**: Swagger integrado e documentado
- [x] **ID15**: Deploy em produção (Render/Vercel)
- [x] **ID16**: API funcional em produção
- [x] **ID17**: ConfigModule para variáveis de ambiente
- [x] **ID18**: Versionamento de API (v1)

### RA5 - Autenticação e segurança
- [x] **ID19**: Autenticação JWT implementada
- [x] **ID20**: Controle de acesso com Guards
- [x] **ID21**: Middleware para CORS e logging
- [x] **ID22**: Interceptores para transformação de resposta

## 🎯 Regras de Negócio da Aplicação

### 1. Gestão de Tasks
```typescript
// Example task structure (local mode - no userId)
{
  id: "uuid",
  title: "Implement feature X",
  description: "Detailed description of the task",
  status: "pending" | "in_progress" | "completed",
  estimatedPomodoros: 3,
  completedPomodoros: 0,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
}
```

### 2. Sessões Pomodoro
- ⏰ **Duração padrão**: 25 minutos de foco
- ⏸️ **Intervalos curtos**: 5 minutos após cada pomodoro
- ⏲️ **Intervalos longos**: 15 minutos após 4 pomodoros
- 🔄 **Auto-início**: Opcional para iniciar próximo pomodoro automaticamente

### 3. Fluxo de Trabalho
```mermaid
sequenceDiagram
    participant Usuário
    participant API
    participant Database

    Usuário->>API: POST /tasks (criar task)
    API->>Database: Salvar task
    Database-->>API: Task criada
    API-->>Usuário: Task criada (201)

    Usuário->>API: POST /pomodoro-sessions (start session)
    API->>Database: Create session caso não exista
    Database-->>API: Session created
    API-->>Usuário: Session started (200)

    loop Timer 25 minutos
        API->>API: Contagem regressiva
    end

    API->>Usuário: End notification
    Usuário->>API: POST /pomodoro-sessions/:id/complete
    API->>Database: Update session and task
    Database-->>API: Dados atualizados
    API-->>Usuário: Pomodoro completado (200)
```

### 4. Estatísticas e Relatórios
- 📈 Pomodoros completos por dia/semana/mês
- 📊 Tasks concluídas vs. estimadas
- 🎯 Taxa de conclusão por task
- ⚡ Produtividade por período do dia

### 5. Notificações e Lembretes
- 🔔 Notificação ao término do pomodoro
- ⏰ Lembretes para intervalos
- 📱 Suporte a webhooks para integrações

## 🛡️ Funcionalidades de Segurança

- **Autenticação JWT** com refresh tokens
- **Rate limiting** para prevenir abuso
- **Validação de dados** em todos os endpoints
- **CORS** configurado apropriadamente
- **Hash de senhas** com bcrypt

## 📦 Estrutura do Projeto

```
src/
├── auth/
├── tasks/
├── pomodoro/
├── users/
├── common/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   └── guards/
├── prisma/
└── main.ts
```

Esta aplicação fornece uma base sólida para implementação da técnica Pomodoro com tracking detalhado por task, ideal para melhorar a produtividade e o foco no trabalho.