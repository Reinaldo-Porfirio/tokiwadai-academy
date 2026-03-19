# 🪟 Guia de Setup no Windows - Tokiwadai Academy

## Erro Comum no Windows

Se você recebeu estes erros:
```
'NODE_ENV' não é reconhecido como um comando interno
DATABASE_URL is required to run drizzle commands
```

Siga este guia para resolver!

## Passo 1: Clonar o Repositório

```bash
git clone https://github.com/Reinaldo-Porfirio/tokiwadai-academy.git
cd tokiwadai-academy
```

## Passo 2: Criar Arquivo `.env.local`

1. Na pasta raiz do projeto, crie um arquivo chamado `.env.local`
2. Copie o conteúdo de `.env.local.example` para `.env.local`
3. Ou execute este comando no PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Seu arquivo `.env.local` deve ficar assim:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-jwt-desenvolvimento-aqui"
VITE_APP_ID="dev-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
OWNER_NAME="Admin"
OWNER_OPEN_ID="admin-id"
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="dev-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="dev-frontend-api-key"
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="dev-website-id"
VITE_APP_TITLE="Tokiwadai Academy"
```

## Passo 3: Instalar Dependências

```bash
pnpm install
```

Se receber erro, tente:
```bash
pnpm install --force
```

## Passo 4: Preparar o Banco de Dados

```bash
pnpm db:push
```

Isso vai criar as tabelas necessárias no banco de dados SQLite.

## Passo 5: Rodar o Projeto

```bash
pnpm run dev
```

O projeto vai estar disponível em: **http://localhost:5173**

## ✅ Verificar se Funcionou

1. Abra o navegador em `http://localhost:5173`
2. Você deve ver a tela de login do Tokiwadai Academy
3. Clique em "Criar conta" para registrar um novo estudante
4. Faça login com suas credenciais

## 🧪 Testar as 3 Correções

### 1️⃣ Testar Likes Instantâneos

1. Faça login como estudante
2. Vá para a aba **Mirror**
3. Clique no botão **"Gostar"** em um post
4. ✅ O coração deve ficar vermelho **instantaneamente**
5. O contador de likes deve aumentar imediatamente

### 2️⃣ Testar Upload de Imagem

1. Na aba **Mirror**, clique em **"Adicionar Imagem"**
2. Selecione uma imagem **menor que 100KB**
3. Escreva um texto no post
4. Clique em **"Postar"**
5. ✅ O post deve aparecer com a imagem

**Nota:** Se a imagem for maior que 100KB, você verá a mensagem:
```
"Imagem muito grande! Máximo 100KB. Comprima a imagem antes de enviar."
```

### 3️⃣ Testar Deletar Post

1. Crie um novo post
2. Clique no botão **"Deletar"** (ícone de lixeira)
3. Confirme a exclusão
4. ✅ O post deve desaparecer imediatamente
5. Após 500ms, a lista deve sincronizar com o backend

## 🔧 Troubleshooting no Windows

### Erro: "pnpm: command not found"

Instale pnpm globalmente:
```bash
npm install -g pnpm
```

Verifique a instalação:
```bash
pnpm --version
```

### Erro: "Port 5173 already in use"

Mude a porta:
```bash
pnpm run dev -- --port 3000
```

### Erro: "Cannot find module"

Limpe o cache e reinstale:
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

### Erro: "Database locked"

Delete o banco de dados e recrie:
```bash
Remove-Item dev.db
pnpm db:push
```

### Erro: "EACCES: permission denied"

Execute o PowerShell como Administrador e tente novamente.

## 📊 Executar Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar testes específicos
pnpm test mirror.test.ts
pnpm test messages.test.ts
pnpm test groups.test.ts
```

## 🚀 Próximos Passos

1. Explore o Mirror (rede social)
2. Teste mensagens privadas com outros estudantes
3. Crie grupos de mensagens
4. Teste o painel administrativo (se tiver credenciais de admin)

## 📞 Precisa de Ajuda?

Se encontrar problemas:

1. **Verifique os logs** no terminal onde `pnpm run dev` está rodando
2. **Abra o DevTools** do navegador (F12) e procure por erros no console
3. **Verifique o arquivo `.env.local`** - certifique-se de que DATABASE_URL está definido
4. **Limpe o cache** - Delete `node_modules` e `pnpm-lock.yaml` e reinstale

## ✅ Checklist Final

- [ ] Git instalado
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado globalmente
- [ ] Repositório clonado
- [ ] `.env.local` criado com DATABASE_URL
- [ ] `pnpm install` executado com sucesso
- [ ] `pnpm db:push` executado com sucesso
- [ ] `pnpm run dev` rodando sem erros
- [ ] Projeto acessível em http://localhost:5173
- [ ] Conseguiu fazer login
- [ ] Likes funcionando instantaneamente
- [ ] Upload de imagem funcionando
- [ ] Deletar post funcionando

Boa sorte! 🎉
