#!/bin/bash

# Zen Focos - Deploy to Render Script
# Este script automatiza o processo de deploy para o Render

echo "🚀 Zen Focos - Deploy to Render"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Este não é um repositório Git. Inicialize o Git primeiro:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <YOUR_GITHUB_REPO_URL>"
    echo "   git push -u origin main"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Você tem mudanças não commitadas!"
    echo "   Faça commit das alterações antes de fazer deploy:"
    echo "   git add ."
    echo "   git commit -m 'Sua mensagem de commit'"
    echo "   git push"
    echo "   ./deploy-render.sh"
    exit 1
fi

# Push to remote
echo "📤 Fazendo push para o repositório remoto..."
git push

echo ""
echo "✅ Código enviado para o repositório!"
echo ""
echo "🔧 PRÓXIMOS PASSOS MANUAIS NO RENDER:"
echo "======================================"
echo ""
echo "1. Acesse https://render.com e faça login"
echo "2. Clique em 'New +'  > 'Web Service'"
echo "3. Conecte seu repositório GitHub"
echo "4. Configure as seguintes opções:"
echo ""
echo "   📋 CONFIGURAÇÕES BÁSICAS:"
echo "   - Name: zen-focos"
echo "   - Runtime: Docker" 
echo "   - Region: Oregon (US West)"
echo "   - Branch: main"
echo "   - Instance Type: Free"
echo ""
echo "   ⚙️  COMANDOS DE BUILD E DEPLOY:"
echo "   - Build Command: npm ci && npx prisma generate && npm run build"
echo "   - Pre-Deploy Command: npx prisma migrate deploy"
echo "   - Start Command: npm run start:prod"
echo ""
echo "   🔐 VARIÁVEIS DE AMBIENTE:"
echo "   - NODE_ENV = production"
echo "   - PORT = 3000"
echo "   - JWT_SECRET = [gere um valor aleatório seguro]"
echo "   - DATABASE_URL = [string de conexão do seu banco MySQL externo]"
echo ""
echo "5. 🗄️  CONFIGURAR BANCO DE DADOS EXTERNO:"
echo "   Opção A - PlanetScale (Recomendado):"
echo "   - Acesse https://planetscale.com"
echo "   - Crie uma conta gratuita"
echo "   - Crie um novo database"
echo "   - Copie a connection string"
echo ""
echo "   Opção B - Railway:"
echo "   - Acesse https://railway.app"
echo "   - Crie um MySQL database"
echo "   - Copie a connection string"
echo ""
echo "   Formato da DATABASE_URL:"
echo "   mysql://usuario:senha@host:3306/database"
echo ""
echo "6. 🚀 Clique em 'Create Web Service'"
echo ""
echo "📖 DOCUMENTAÇÃO COMPLETA:"
echo "========================="
echo "Consulte o README.md para instruções detalhadas de deploy e configuração."
echo ""
echo "🎯 APÓS O DEPLOY:"
echo "================="
echo "- Sua API estará disponível em: https://zen-focos.onrender.com"
echo "- Teste os endpoints usando os arquivos em api-testes/"
echo "- Monitore os logs no dashboard do Render"
echo ""
echo "✨ Deploy configurado com sucesso! Siga os passos acima no Render."