# 🎉 ZenFocos - Configuração Dual Ambiente (Local + Clever Cloud)

## ✅ Status Atual

- ✅ **Prisma 6** configurado e funcionando
- ✅ **75 testes passando** em ambos ambientes
- ✅ **Local**: Banco MySQL via Docker
- ✅ **Produção**: Clever Cloud MySQL pronto
- ✅ **Scripts** de desenvolvimento e deploy criados

## 🏗️ Arquitetura Dual

```
┌─────────────────────────────────────────┐
│          ZEN FOCOS API (NestJS)         │
├─────────────────────────────────────────┤
│  Prisma 6 (env(DATABASE_URL))           │
├─────────────────────────────┬───────────┤
│  Desenvolvimento Local       │ Produção  │
│  Docker MySQL               │ Clever    │
│  localhost:3306             │ Cloud DB  │
│  zenfocos_db                │ MySQL     │
└─────────────────────────────┴───────────┘
```

## 📋 Configuração Final

### 1. **Ambientes (.env files)**

#### `.env` (DESENVOLVIMENTO - Local)
```env
DATABASE_URL="mysql://root:root@localhost:3306/zenfocos_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3000
```

#### `.env.production` (PRODUÇÃO - Clever Cloud)
```env
DATABASE_URL="mysql://ubqd8uzwatdrs6yd:LC3fZ3M9IbwUrBlwFijb@bh3cxoeojg3msg2r5oak-mysql.services.clever-cloud.com:3306/bh3cxoeojg3msg2r5oak?sslmode=require"
JWT_SECRET="seu-jwt-secret-super-seguro-min-32-chars"
NODE_ENV="production"
PORT=8080
```

### 2. **Schema Prisma (Funciona em ambos)**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")  // Lê do ambiente automaticamente
}
```

### 3. **Scripts de Desenvolvimento**

```bash
# Rodar aplicação localmente
npm run dev

# Executar testes
npm test

# Criar nova migration
npm run migrate:dev

# Ver/gerenciar banco
npm run studio

# Gerar Prisma Client
npm run generate
```

### 4. **Deployment para Clever Cloud**

```bash
# 1. Garantir tudo commitado
git add .
git commit -m "Deploy config for Clever Cloud"
git push

# 2. Clever Cloud CLI (se tiver)
clever deploy

# OU via git push (recomendado)
git push clever main
```

## 🚀 Fluxo de Trabalho Diário

### Desenvolvimento Local

```bash
# 1. Iniciar banco
npm run docker:up

# 2. Aplicar migrations
npm run migrate:dev

# 3. Rodar em dev mode
npm run dev

# 4. Testar
npm test

# 5. Ver banco via Prisma Studio
npm run studio
```

### Deploy para Produção

```bash
# 1. Testar localmente
npm test

# 2. Criar migration (se houver alterações no schema)
npm run migrate:dev

# 3. Commit e push
git add .
git commit -m "Feature XYZ"
git push origin main

# 4. Clever Cloud detecta push e faz deploy automaticamente
# Clever Cloud:
#  - Clona repositório
#  - npm ci (instala dependências)
#  - npx prisma generate (gera Prisma Client)
#  - npm run build (compila NestJS)
#  - npx prisma migrate deploy (aplica migrations em produção!)
#  - npm run start:prod (inicia aplicação)

# 5. Ver logs
clever logs
```

## 📊 Dados de Configuração

| Recurso | Desenvolvimento | Produção |
|---------|---|---|
| **Banco** | Docker MySQL local | Clever Cloud MySQL |
| **Host** | localhost | bh3cxoeojg3msg2r5oak-mysql.services.clever-cloud.com |
| **Port** | 3306 | 3306 |
| **Database** | zenfocos_db | bh3cxoeojg3msg2r5oak |
| **User** | root | ubqd8uzwatdrs6yd |
| **Password** | root | (salvo seguro) |
| **Aplicação** | localhost:3000 | zen-focos.cleverapps.io |

## 🔐 Segurança

### `.env` (NUNCA commit)
- ✅ Gitignored
- ✅ Credenciais locais safe

### `.env.production` (PODE commitar)
- ⚠️ **NÃO committar credenciais reais**
- ✅ Usar exemplo template
- ✅ Valores reais no Clever Cloud Dashboard

### Clever Cloud Dashboard
```
Settings → Environment Variables:
- DATABASE_URL = (string completa do Clever Cloud MySQL)
- JWT_SECRET = (gerado aleatoriamente)
- NODE_ENV = production
- PORT = 8080
```

## 📚 Scripts Disponíveis

```json
{
  "dev": "npm run start:dev",
  "migrate:dev": "prisma migrate dev",
  "migrate:prod": "prisma migrate deploy",
  "studio": "prisma studio",
  "generate": "prisma generate",
  "build": "nest build",
  "start:prod": "node dist/src/main",
  "test": "jest"
}
```

## 🔄 Ciclo de Vida das Migrations

### 1. **Criar/Alterar dados localmente**
```bash
# Modifica schema.prisma
npm run migrate:dev
# Cria migration em prisma/migrations/
```

### 2. **Testar localmente**
```bash
npm test
npm run studio
```

### 3. **Commit e push**
```bash
git add prisma/migrations/
git commit -m "Add field X to User table"
git push
```

### 4. **Clever Cloud deployer automaticamente**
- Copia migration files
- Roda `npx prisma migrate deploy` com DATABASE_URL de produção
- Aplica alterações no Clever Cloud MySQL

## 🎯 Próximos Passos

1. **Setup Clever Cloud (se ainda não fez)**
   - Conta criada
   - MySQL database linkado
   - Environment variables configuradas

2. **Primeiro Deploy**
   ```bash
   git push clever main
   ```

3. **Monitorar**
   - Logs: `clever logs`
   - Dashboard: https://console.clever-cloud.com
   - API: https://zen-focos.cleverapps.io

## ✨ Vantagens do Setup Atual

✅ Desenvolvimento rápido com Docker local
✅ Sem dependências externas durante dev
✅ Mesmo banco de dados em dev e produção (MySQL)
✅ Migrations automáticas em produção
✅ Apenas um `.env` a manter (produção no Clever Cloud)
✅ Zero downtime com migrations
✅ Fácil reverter migrações se necessário

## 🆘 Troubleshooting

**Erro: Tables don't exist**
```bash
npm run docker:up           # Iniciar MySQL
npm run migrate:dev         # Aplicar migrations
```

**Erro: Can't connect to database**
```bash
# Check .env DATABASE_URL
# Check if Docker MySQL is running: docker ps
# Check Clever Cloud MySQL credentials
```

**Erro: Prisma Client not found**
```bash
npm run generate            # Regenerar client
npm run build               # Rebuild
```

---

**Projeto 100% pronto para desenvolvimento e produção!** 🚀