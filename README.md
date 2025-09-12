<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

````markdown
# 🍅 ZenFocos API - Pomodoro por Task

## 👨‍💻 Autor
**Seu Nome Completo**

## 🔗 Link de Produção
`https://zenfocos-api.example.com` (substituir pelo link real)

## 📋 Descrição do Projeto
ZenFocos é uma API RESTful construída com NestJS para gerenciar sessões Pomodoro focadas em tarefas. A API permite criar e gerenciar tasks, iniciar/completar sessões de pomodoro, controlar intervalos e gerar estatísticas de produtividade.

## 📌 Pré-requisitos
- Node.js 18+
- npm 9+ (ou yarn)
- PostgreSQL 12+
- Redis (opcional, para cache)

## 🚀 Instalação
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/zenfocos-api.git
cd zenfocos-api

# Instalar dependências
npm install

# Copiar variáveis de ambiente de exemplo
cp .env.example .env
```

## 🛠️ Configuração do Banco de Dados
```bash
# Criar banco de dados (exemplo PostgreSQL)
createdb zenfocos_db

# Rodar migrações (Prisma)
npx prisma migrate dev

# Popular dados iniciais (opcional)
npx prisma db seed
```

## 🔐 Variáveis de Ambiente (.env)
Crie um arquivo `.env` a partir de `.env.example` e ajuste os valores.

Exemplo de `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zenfocos_db"
JWT_SECRET="seu-jwt-secret-super-seguro"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development
```

## ▶️ Execução
```bash
# Desenvolvimento (watch)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📊 Diagrama de Entidade-Relacionamento (ERD)
- O diagrama está disponível em `project-description.md` (mermaid) ou crie uma imagem `docs/erd.png` e faça referência aqui.

Exemplo (mermaid) no `project-description.md`.

## 📚 Documentação Swagger
Swagger UI: `https://zenfocos-api.example.com/api/docs` (substituir pela URL real em produção)

## ✅ Checklist de Funcionalidades (RA / ID)

RA1 - Projetar e desenvolver API com NestJS
- [ ] **ID1**: Ambiente configurado com NestJS e arquitetura modular
- [ ] **ID2**: Lógica de negócio separada em services
- [ ] **ID3**: Injeção de dependência implementada
- [ ] **ID4**: Rotas HTTP com parâmetros corretos
- [ ] **ID5**: Tratamento de erros global
- [ ] **ID6**: DTOs para validação de dados
- [ ] **ID7**: Pipes de validação aplicados

RA2 - Persistência com banco relacional
- [ ] **ID8**: Modelagem de dados com ERD
- [ ] **ID9**: Conexão com PostgreSQL via Prisma
- [ ] **ID10**: Migrações implementadas
- [ ] **ID11**: CRUD completo para Tasks e PomodoroSessions

RA3 - Testes automatizados
- [ ] **ID12**: Testes com Jest implementados
- [ ] **ID13**: Cobertura de testes para rotas principais

RA4 - Documentação e Deploy
- [ ] **ID14**: Swagger integrado e documentado
- [ ] **ID15**: Deploy em produção (Render/Vercel)
- [ ] **ID16**: API funcional em produção
- [ ] **ID17**: ConfigModule para variáveis de ambiente
- [ ] **ID18**: Versionamento de API (v1)

RA5 - Autenticação e segurança
- [ ] **ID19**: Autenticação JWT implementada
- [ ] **ID20**: Controle de acesso com Guards
- [ ] **ID21**: Middleware para CORS e logging
- [ ] **ID22**: Interceptores para transformação de resposta

## 🔎 Endpoints Principais
- `POST /api/v1/auth/login` - Autenticação
- `GET /api/v1/tasks` - Listar tasks
- `POST /api/v1/tasks` - Criar task
- `POST /api/v1/pomodoro/start` - Iniciar pomodoro
- `POST /api/v1/pomodoro/complete` - Completar pomodoro

## 🧪 Testes
Comandos:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Cobertura
npm run test:cov
```

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

## ☁️ Deploy
Sugestões: Render, Vercel, Heroku. Configure variáveis de ambiente no serviço e aponte o banco de dados para PostgreSQL gerenciado.

## 📌 Observações
- Substitua `Seu Nome Completo` pelo nome do aluno responsável.
- Atualize os links de produção e do repositório conforme necessários.

````
