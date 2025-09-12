<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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

## 📚 Documentação Swagger
Swagger UI: `https://zenfocos-api.example.com/api/docs` (substituir pela URL real em produção)

## ✅ Checklist de Funcionalidades (RA / ID)

RA1 - Projetar e desenvolver uma API funcional utilizando o framework NestJS.
- [ ] **ID1**: O aluno configurou corretamente o ambiente de desenvolvimento e criou a API utilizando NestJS, com rotas e controladores que seguem a arquitetura modular.
- [ ] **ID2**: O aluno aplicou boas práticas de organização da lógica de negócios, garantindo que os services contenham a lógica de negócio e sejam chamados pelos controladores, separando responsabilidades corretamente.
- [ ] **ID3**: O aluno utilizou providers e configurou adequadamente a injeção de dependência no NestJS, garantindo uma arquitetura modular e escalável.
- [ ] **ID4**: O aluno demonstrou a habilidade de criar e manipular rotas HTTP, manipulando parâmetros de rota, query e body, lidando corretamente com requisições e respostas.
- [ ] **ID5**: O aluno aplicou boas práticas de tratamento de erros, utilizando filtros globais e personalizando as mensagens de erro para garantir respostas claras e consistentes.
- [ ] **ID6**: O aluno criou classes DTO (Data Transfer Objects) para garantir a validação e consistência dos dados em diferentes endpoints, utilizando pipes para validar entradas de dados.
- [ ] **ID7**: O aluno aplicou corretamente pipes de validação no NestJS, verificando entradas inválidas e assegurando a integridade dos dados transmitidos.

RA2 - Implementar persistência de dados com um banco de dados relacional utilizando Prisma ou TypeORM.
- [ ] **ID8**: O aluno modelou corretamente os dados da aplicação, definindo entidades, suas relações e campos necessários, refletidos em um Diagrama de Entidade-Relacionamento (ERD).
- [ ] **ID9**: O aluno configurou e conectou a API a um banco de dados relacional (PostgreSQL, MySQL, etc.) utilizando Prisma ou TypeORM.
- [ ] **ID10**: O aluno criou e aplicou migrações de banco de dados para garantir a consistência dos dados entre desenvolvimento e produção.
- [ ] **ID11**: O aluno implementou corretamente as operações CRUD (Create, Read, Update, Delete) para pelo menos uma entidade no projeto, utilizando NestJS.

RA3 - Realizar testes automatizados para garantir a qualidade da API.
- [ ] **ID12**: O aluno implementou testes automatizados (unitários ou de integração) utilizando Jest, validando funcionalidades críticas da API.
- [ ] **ID13**: O aluno garantiu a cobertura de testes para, pelo menos, as principais rotas e serviços da API, incluindo operações CRUD.

RA4 - Gerar a documentação da API e realizar o deploy em um ambiente de produção.
- [ ] **ID14**: O aluno integrou corretamente o Swagger à API, gerando a documentação completa e interativa dos endpoints, parâmetros e respostas da API, com exemplos de requisições e respostas.
- [ ] **ID15**: O aluno realizou o deploy da API em uma plataforma de hospedagem na nuvem (ex.: Render.com, Heroku, Vercel, etc.), garantindo que a API estivesse acessível publicamente.
- [ ] **ID16**: O aluno garantiu que a API funcionasse corretamente no ambiente de produção, incluindo a documentação Swagger e o banco de dados.
- [ ] **ID17**: O aluno realizou a configuração correta de variáveis de ambiente usando o ConfigModule do NestJS.
- [ ] **ID18**: O aluno implementou corretamente o versionamento de APIs REST no NestJS, assegurando que diferentes versões da API pudessem coexistir.

RA5 - Implementar autenticação, autorização e segurança em APIs utilizando JWT, Guards, Middleware e Interceptadores.
- [ ] **ID19**: O aluno configurou a autenticação na API utilizando JWT (JSON Web Tokens).
- [ ] **ID20**: O aluno implementou controle de acesso baseado em roles e níveis de permissão, utilizando Guards para verificar permissões em rotas específicas.
- [ ] **ID21**: O aluno configurou e utilizou middleware para manipular requisições antes que elas chegassem aos controladores, realizando tarefas como autenticação, logging ou tratamento de CORS.
- [ ] **ID22**: O aluno implementou interceptadores para realizar logging ou modificar as respostas antes de enviá-las ao cliente.

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
```text
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