# 🚀 Guia de Setup Local - Tokiwadai Academy

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** 18+ (https://nodejs.org)
- **pnpm** (instale com: `npm install -g pnpm`)
- **Git** (https://git-scm.com)

## Passo 1: Clonar o Repositório

```bash
git clone https://github.com/Reinaldo-Porfirio/tokiwadai-academy.git
cd tokiwadai-academy
```

## Passo 2: Instalar Dependências

```bash
pnpm install
```

Se receber erro, tente:
```bash
pnpm install --force
```

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="seu-secret-jwt-aqui-pode-ser-qualquer-string"

# OAuth (Manus)
VITE_APP_ID="seu-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Owner Info
OWNER_NAME="Admin"
OWNER_OPEN_ID="admin-id"

# Manus APIs
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua-frontend-api-key"

# Analytics
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"
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

## 🧪 Testando as 3 Correções

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

## 🔧 Troubleshooting

### Erro: "Port 5173 already in use"
```bash
# Mude a porta
pnpm run dev -- --port 3000
```

### Erro: "Cannot find module"
```bash
# Limpe o cache e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Database locked"
```bash
# Delete o banco de dados e recrie
rm dev.db
pnpm db:push
```

### Erro de TypeScript
```bash
# Verifique os tipos
pnpm tsc --noEmit
```

## 📊 Executar Testes

```bash
# Rodar todos os testes
pnpm test

# Rodar testes específicos
pnpm test mirror.test.ts
pnpm test messages.test.ts
pnpm test groups.test.ts
```

## 📝 Estrutura do Projeto

```
tokiwadai-academy/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (MirrorPage, MessagesPage, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Utilidades (tRPC client, etc)
│   └── index.html
├── server/                # Backend Express
│   ├── routers/           # tRPC routers (mirror, messages, groups)
│   ├── db.ts              # Funções de banco de dados
│   └── routers.ts         # Router principal
├── drizzle/               # Schema do banco de dados
│   └── schema.ts
└── package.json
```

## 🚀 Deploy

Para fazer deploy do projeto:

1. **Manus (Recomendado):** Use o botão "Publish" na interface do Manus
2. **Vercel:** `vercel deploy`
3. **Railway:** `railway deploy`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no terminal
2. Abra o DevTools do navegador (F12) e procure por erros no console
3. Verifique se todas as dependências foram instaladas corretamente

## ✅ Checklist de Verificação

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado globalmente
- [ ] Repositório clonado
- [ ] `pnpm install` executado com sucesso
- [ ] `.env.local` configurado
- [ ] `pnpm db:push` executado
- [ ] `pnpm run dev` rodando sem erros
- [ ] Projeto acessível em http://localhost:5173
- [ ] Likes funcionando instantaneamente
- [ ] Upload de imagem funcionando
- [ ] Deletar post funcionando

Boa sorte! 🎉
