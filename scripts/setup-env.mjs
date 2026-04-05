#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envLocalPath = path.join(projectRoot, '.env.local');

// Credenciais reais do Manus (obtidas do sistema)
const envContent = `# Database - Para desenvolvimento local, use SQLite
DATABASE_URL="file:./dev.db"

# JWT Secret - Credencial real do Manus
JWT_SECRET="Qwpi5GtHRaFkFEkvfSd33s"

# OAuth (Manus) - Credenciais reais
VITE_APP_ID="g5ETMEfeyEM9e52awWdL6n"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im"

# Owner Info - Informações reais do proprietário
OWNER_NAME="Reinaldo Porfirio Vieira"
OWNER_OPEN_ID="Vp4nCgPpASFqSm75P7RVjn"

# Manus APIs - Credenciais reais
BUILT_IN_FORGE_API_URL="https://forge.manus.ai"
BUILT_IN_FORGE_API_KEY="ELYbAzBWqB4wxHVVSigSAb"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.ai"
VITE_FRONTEND_FORGE_API_KEY="ELYbAzBWqB4wxHVVSigSAb"

# Analytics - Deixe como está para desenvolvimento
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="dev-website-id-tokiwadai"

# App Info
VITE_APP_TITLE="Tokiwadai Academy - Sistema Web RPG"
VITE_APP_LOGO="https://files.manuscdn.com/user_upload_by_module/web_dev_logo/310519663253164165/BsVfGBxtxzZsONED.png"

# CREDENCIAIS DE TESTE
# Admin: usuario=admin, senha=admin123
# Estudante: usuario=TKW-2026-00001, senha=123456
`;

try {
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local já existe');
  } else {
    fs.writeFileSync(envLocalPath, envContent);
    console.log('✅ .env.local criado com sucesso!');
  }
} catch (error) {
  console.error('❌ Erro ao criar .env.local:', error.message);
  process.exit(1);
}
