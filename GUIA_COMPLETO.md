# 🎓 Tokiwadai Academy - Guia Completo de Uso

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Instalação e Configuração](#instalação-e-configuração)
3. [Como Usar no VS Code](#como-usar-no-vs-code)
4. [Acessando via LAN](#acessando-via-lan)
5. [Guia de Funcionalidades](#guia-de-funcionalidades)
6. [Credenciais Padrão](#credenciais-padrão)
7. [Troubleshooting](#troubleshooting)

---

## 🌟 Visão Geral

**Tokiwadai Academy** é um sistema web completo de gerenciamento acadêmico para escolas de RPG de mesa. O sistema oferece:

- ✅ **Autenticação Dual**: Login de estudantes e administradores
- ✅ **Geração Automática de ID**: Formato TKW-[ANO]-[NÚMERO]
- ✅ **Painel de Estudante**: Perfil, Mirror (rede social), mensagens, calendário, biblioteca, mapa
- ✅ **Painel Administrativo**: CRUD de estudantes, moderação, gerenciamento de conteúdo
- ✅ **Banco de Dados MySQL**: Totalmente estruturado com Drizzle ORM
- ✅ **API tRPC**: Backend type-safe com procedures bem definidas

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- pnpm (gerenciador de pacotes)
- MySQL/MariaDB rodando localmente ou em nuvem
- VS Code (recomendado)

### Passo 1: Clonar e Instalar Dependências

```bash
cd /home/ubuntu/tokiwadai-academy
pnpm install
```

### Passo 2: Configurar Variáveis de Ambiente

O arquivo `.env` já contém as variáveis necessárias. Verifique se estão corretas:

```bash
# Banco de dados
DATABASE_URL=mysql://user:password@localhost:3306/tokiwadai

# Autenticação
JWT_SECRET=sua_chave_secreta_aqui

# OAuth (Manus)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
```

### Passo 3: Executar Migrations

```bash
pnpm db:push
```

Isso criará todas as tabelas no banco de dados automaticamente.

### Passo 4: Criar Admin Inicial

Use a API para criar o primeiro administrador:

```bash
curl -X POST http://localhost:3000/api/trpc/auth.createAdmin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha_segura_123"}'
```

---

## 💻 Como Usar no VS Code

### Abrir o Projeto

1. Abra VS Code
2. Clique em `File > Open Folder`
3. Navegue até `/home/ubuntu/tokiwadai-academy`
4. Clique em `Select Folder`

### Estrutura do Projeto

```
tokiwadai-academy/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Login, Register, Dashboard)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (tRPC client)
│   │   └── App.tsx        # Roteamento principal
│   └── index.html
├── server/                 # Backend Express + tRPC
│   ├── routers/           # Rotas de API (auth, students, mirror, etc)
│   ├── utils/             # Utilitários (hash, validação)
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Framework core (não editar)
├── drizzle/               # Schema do banco de dados
│   └── schema.ts
└── package.json
```

### Iniciar o Servidor de Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd /home/ubuntu/tokiwadai-academy
pnpm dev
```

O servidor iniciará em `http://localhost:3000`

**Terminal 2 - Abrir no Navegador:**
```bash
# Abra seu navegador e acesse:
http://localhost:3000
```

### Hot Reload

O projeto está configurado com hot reload. Qualquer mudança em:
- `client/src/**` → Frontend recarrega automaticamente
- `server/**` → Backend reinicia automaticamente

### Executar Testes

```bash
pnpm test
```

Isso executará todos os testes unitários com Vitest.

### Verificar Tipos TypeScript

```bash
pnpm check
```

---

## 🌐 Acessando via LAN

Para acessar o sistema de outros computadores na mesma rede:

### Passo 1: Encontrar o IP da Máquina

**No Linux/Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**No Windows:**
```bash
ipconfig
```

Procure por um IP como `192.168.x.x` ou `10.0.x.x`

### Passo 2: Iniciar o Servidor

```bash
cd /home/ubuntu/tokiwadai-academy
pnpm dev
```

### Passo 3: Acessar de Outro Computador

Abra o navegador em outro computador e acesse:

```
http://SEU_IP:3000
```

Exemplo: `http://192.168.1.100:3000`

### Configurar para Acesso Externo (Opcional)

Se quiser acessar de fora da rede local, você pode usar:

**ngrok (recomendado para testes):**
```bash
# Instale ngrok
npm install -g ngrok

# Exponha a porta 3000
ngrok http 3000
```

Isso gerará uma URL pública como `https://abc123.ngrok.io`

---

## 📚 Guia de Funcionalidades

### 1️⃣ Login de Estudante

**URL:** `http://localhost:3000/login`

**Credenciais de Teste:**
- **ID de Estudante:** TKW-2026-00001
- **Usuário:** estudante1
- **Senha:** senha123

**Ou criar uma nova conta:**
- Clique em "Criar conta"
- Preencha o formulário com dados válidos
- Um ID será gerado automaticamente

### 2️⃣ Login de Administrador

**URL:** `http://localhost:3000/login` → Aba "Administrador"

**Credenciais Padrão:**
- **Usuário:** admin
- **Senha:** admin123

### 3️⃣ Painel do Estudante

Após fazer login como estudante, você terá acesso a:

- **Perfil**: Visualizar e editar informações pessoais
- **Mirror**: Rede social interna (em desenvolvimento)
- **Mensagens**: Chat privado com outros estudantes (em desenvolvimento)
- **Calendário**: Eventos acadêmicos criados por admins
- **Biblioteca**: Arquivos e materiais de aula
- **Mapa**: Visualizar os 23 distritos de Axis
- **Configurações**: Preferências de conta

### 4️⃣ Painel Administrativo

Após fazer login como admin, você terá acesso a:

- **Dashboard**: Estatísticas gerais (total de estudantes, posts, etc)
- **Gerenciar Estudantes**: CRUD completo (criar, editar, deletar, suspender)
- **Moderação**: Deletar posts e comentários inapropriados
- **Calendário**: Criar eventos acadêmicos
- **Biblioteca**: Upload de arquivos e materiais
- **Configurações**: Personalizar nome da escola, cores, logo

---

## 🔐 Credenciais Padrão

### Admin Padrão
```
Usuário: admin
Senha: admin123
```

### Estudante de Teste
```
ID: TKW-2026-00001
Usuário: estudante1
Senha: senha123
```

### Criar Novos Usuários

**Via API (curl):**

```bash
# Criar novo estudante
curl -X POST http://localhost:3000/api/trpc/auth.registerStudent \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"João Silva",
    "username":"joao_silva",
    "email":"joao@example.com",
    "password":"senha_segura_123",
    "birthDate":"2010-05-15",
    "grade":3,
    "district":5
  }'

# Criar novo admin
curl -X POST http://localhost:3000/api/trpc/auth.createAdmin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin2","password":"senha_segura_123"}'
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"

**Solução:**
```bash
pnpm install
pnpm db:push
```

### Problema: Porta 3000 já em uso

**Solução:**
```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use uma porta diferente
PORT=3001 pnpm dev
```

### Problema: Erro de conexão com banco de dados

**Verificar:**
1. MySQL está rodando? `sudo systemctl status mysql`
2. DATABASE_URL está correto no `.env`?
3. Credenciais estão certas?

**Solução:**
```bash
# Reiniciar MySQL
sudo systemctl restart mysql

# Recriar migrations
pnpm db:push
```

### Problema: Hot reload não funciona

**Solução:**
```bash
# Limpar cache
rm -rf node_modules/.vite

# Reiniciar servidor
pnpm dev
```

### Problema: Testes falhando

**Solução:**
```bash
# Limpar cache de testes
rm -rf node_modules/.vitest

# Rodar testes novamente
pnpm test
```

---

## 📝 Notas Importantes

### Formato de ID de Estudante

O ID é gerado automaticamente no formato: **TKW-[ANO]-[NÚMERO]**

Exemplo: `TKW-2026-00001`

- **TKW**: Prefixo fixo (Tokiwadai)
- **2026**: Ano atual (atualiza automaticamente)
- **00001**: Número sequencial (incrementa para cada novo estudante)

### Limites de Conteúdo

- **Bio do Perfil**: Máximo 500 caracteres
- **Posts no Mirror**: Máximo 500 caracteres
- **Mensagens**: Máximo 1000 caracteres
- **Série**: 1 a 6
- **Distrito**: 1 a 23

### Segurança

- Todas as senhas são hasheadas com bcrypt
- Proteção contra SQL injection via Drizzle ORM
- Validação de entrada em todos os endpoints
- CORS configurado para LAN

---

## 🎯 Próximas Funcionalidades

- [ ] Upload de fotos de perfil
- [ ] Implementação completa do Mirror (posts, likes, comentários)
- [ ] Sistema de mensagens privadas com notificações
- [ ] Calendário interativo com drag-and-drop
- [ ] Visualizador de PDFs na biblioteca
- [ ] Mapa interativo de Axis com zoom
- [ ] Sistema de notificações push
- [ ] Backup automático para S3

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte os logs do servidor: `pnpm dev`
3. Verifique o console do navegador (F12)
4. Rode os testes: `pnpm test`

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026  
**Desenvolvido para:** Tokiwadai Academy, Axis City
