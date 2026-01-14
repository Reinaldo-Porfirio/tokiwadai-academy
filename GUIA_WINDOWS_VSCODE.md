# 🪟 Tokiwadai Academy - Guia Completo para Windows + VS Code

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Passo 1: Instalar Node.js](#passo-1-instalar-nodejs)
3. [Passo 2: Instalar Git](#passo-2-instalar-git)
4. [Passo 3: Instalar MySQL](#passo-3-instalar-mysql)
5. [Passo 4: Abrir Projeto no VS Code](#passo-4-abrir-projeto-no-vs-code)
6. [Passo 5: Instalar Dependências](#passo-5-instalar-dependências)
7. [Passo 6: Configurar Banco de Dados](#passo-6-configurar-banco-de-dados)
8. [Passo 7: Rodar o Servidor](#passo-7-rodar-o-servidor)
9. [Passo 8: Acessar no Navegador](#passo-8-acessar-no-navegador)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

Antes de começar, você precisa de:
- ✅ Windows 10 ou superior
- ✅ VS Code instalado
- ✅ Conexão com a internet
- ✅ Permissões de administrador (para instalar programas)

---

## 🔧 PASSO 1: Instalar Node.js

Node.js é a base para rodar o projeto.

### 1.1 Baixar Node.js

1. Abra seu navegador e acesse: **https://nodejs.org**
2. Você verá dois botões:
   - **LTS** (versão estável) - **CLIQUE AQUI**
   - Current (versão nova)
3. Clique em **LTS** (recomendado)
4. Um arquivo `.msi` será baixado (ex: `node-v20.11.0-x64.msi`)

### 1.2 Instalar Node.js

1. Abra o arquivo baixado (clique duas vezes)
2. Clique em **Next** até aparecer a tela de "Custom Setup"
3. Deixe tudo marcado (padrão está bom)
4. Clique em **Next** novamente
5. Clique em **Install**
6. Aguarde a instalação (pode levar 2-3 minutos)
7. Clique em **Finish**

### 1.3 Verificar Instalação

1. Abra o **Prompt de Comando** (CMD):
   - Pressione `Win + R`
   - Digite `cmd`
   - Pressione `Enter`

2. Digite o comando:
```bash
node --version
```

3. Você deve ver algo como: `v20.11.0` ✅

4. Agora teste o npm (gerenciador de pacotes):
```bash
npm --version
```

5. Você deve ver algo como: `10.2.0` ✅

---

## 📦 PASSO 2: Instalar Git

Git é necessário para clonar o projeto.

### 2.1 Baixar Git

1. Acesse: **https://git-scm.com/download/win**
2. Clique em **Download for Windows**
3. Um arquivo `.exe` será baixado

### 2.2 Instalar Git

1. Abra o arquivo baixado
2. Clique em **Next** em todas as telas
3. Quando aparecer "Choosing the default editor used by Git", deixe como está
4. Clique em **Install**
5. Clique em **Finish**

### 2.3 Verificar Instalação

1. Abra o **Prompt de Comando** (CMD) novamente
2. Digite:
```bash
git --version
```

3. Você deve ver algo como: `git version 2.43.0` ✅

---

## 🗄️ PASSO 3: Instalar MySQL

MySQL é o banco de dados do projeto.

### 3.1 Baixar MySQL

1. Acesse: **https://dev.mysql.com/downloads/mysql/**
2. Procure por **MySQL Community Server**
3. Clique em **Download** (versão 8.0 ou superior)
4. Você pode fazer login ou pular (clique em "No thanks, just start my download")

### 3.2 Instalar MySQL

1. Abra o arquivo baixado (`.msi`)
2. Clique em **Next**
3. Selecione **Custom** (para escolher o que instalar)
4. Clique em **Next**
5. Deixe tudo marcado (padrão está bom)
6. Clique em **Next**
7. Clique em **Execute** (vai instalar os arquivos)
8. Quando terminar, clique em **Next**
9. Na tela "MySQL Server 8.0.36 - Configuration":
   - Deixe **Config Type** como "Development Machine"
   - Deixe **Port** como `3306`
   - Clique em **Next**
10. Deixe **MySQL User Configuration** como está
11. Clique em **Next**
12. Na tela **Windows Service**, deixe marcado "Configure MySQL Server as a Windows Service"
13. Clique em **Next**
14. Clique em **Execute** para aplicar as configurações
15. Quando terminar, clique em **Finish**

### 3.3 Verificar Instalação

1. Abra o **Prompt de Comando** (CMD)
2. Digite:
```bash
mysql --version
```

3. Você deve ver algo como: `mysql Ver 8.0.36` ✅

---

## 💻 PASSO 4: Abrir Projeto no VS Code

### 4.1 Baixar o Projeto

1. Abra o **Prompt de Comando** (CMD)
2. Navegue até a pasta onde quer salvar o projeto:
```bash
cd Desktop
```

3. Clone o projeto (copie o comando abaixo):
```bash
git clone https://github.com/seu-usuario/tokiwadai-academy.git
```

**OU** se você já tem o projeto em uma pasta, pule para o próximo passo.

### 4.2 Abrir no VS Code

**Opção A - Via VS Code:**
1. Abra VS Code
2. Clique em **File > Open Folder**
3. Navegue até a pasta `tokiwadai-academy`
4. Clique em **Select Folder**

**Opção B - Via Prompt de Comando:**
1. Abra o **Prompt de Comando** (CMD)
2. Navegue até a pasta do projeto:
```bash
cd Desktop\tokiwadai-academy
```

3. Digite:
```bash
code .
```

4. VS Code abrirá automaticamente com o projeto

### 4.3 Explorar a Estrutura

No VS Code, você verá:
```
tokiwadai-academy/
├── client/          ← Frontend (React)
├── server/          ← Backend (Express + tRPC)
├── drizzle/         ← Banco de dados
├── package.json     ← Dependências
└── GUIA_COMPLETO.md ← Documentação
```

---

## 📥 PASSO 5: Instalar Dependências

### 5.1 Abrir Terminal no VS Code

1. No VS Code, pressione: `Ctrl + '` (backtick)
2. Um terminal abrirá na parte inferior
3. Você verá algo como:
```
PS C:\Users\SeuUsuario\Desktop\tokiwadai-academy>
```

### 5.2 Instalar pnpm

pnpm é o gerenciador de pacotes que o projeto usa.

1. No terminal do VS Code, digite:
```bash
npm install -g pnpm
```

2. Aguarde a instalação (1-2 minutos)

3. Verifique a instalação:
```bash
pnpm --version
```

4. Você deve ver algo como: `8.15.0` ✅

### 5.3 Instalar Dependências do Projeto

1. No terminal, digite:
```bash
pnpm install
```

2. Isso vai baixar todos os pacotes necessários (pode levar 5-10 minutos)

3. Você verá no final:
```
✓ Packages in scope: tokiwadai-academy
✓ Lockfile is up-to-date
✓ 1,234 packages in total (from a lockfile with 1,234 entries)
```

✅ Pronto! Dependências instaladas.

---

## 🗄️ PASSO 6: Configurar Banco de Dados

### 6.1 Criar Arquivo .env

1. No VS Code, clique com botão direito na pasta raiz
2. Selecione **New File**
3. Digite: `.env`
4. Pressione `Enter`

### 6.2 Adicionar Configurações

1. Copie e cole no arquivo `.env`:

```env
# Banco de dados MySQL
DATABASE_URL=mysql://root:root@localhost:3306/tokiwadai

# Autenticação
JWT_SECRET=sua_chave_secreta_super_segura_2026

# OAuth (Manus)
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Outros
OWNER_NAME=Admin
OWNER_OPEN_ID=admin_id
```

2. Pressione `Ctrl + S` para salvar

### 6.3 Criar Banco de Dados

1. Abra o **Prompt de Comando** (CMD)
2. Conecte ao MySQL:
```bash
mysql -u root -p
```

3. Digite a senha (padrão é `root` ou deixe em branco e pressione Enter)

4. Você verá:
```
mysql>
```

5. Crie o banco de dados:
```sql
CREATE DATABASE tokiwadai;
```

6. Você verá:
```
Query OK, 1 row affected (0.01 sec)
```

7. Saia do MySQL:
```sql
EXIT;
```

### 6.4 Rodar Migrations

1. No terminal do VS Code, digite:
```bash
pnpm db:push
```

2. Você verá:
```
✓ Migrations applied successfully
✓ 12 tables created
```

✅ Banco de dados configurado!

---

## 🚀 PASSO 7: Rodar o Servidor

### 7.1 Iniciar Servidor de Desenvolvimento

1. No terminal do VS Code, digite:
```bash
pnpm dev
```

2. Você verá algo como:
```
[18:15:51] Server running on http://localhost:3000/
[18:15:52] [OAuth] Initialized with baseURL: https://api.manus.im
[18:15:53] Vite client ready on http://localhost:3000/
```

✅ Servidor rodando!

### 7.2 Deixar o Terminal Aberto

**IMPORTANTE:** Deixe este terminal aberto enquanto estiver usando o projeto. Se fechar, o servidor para.

---

## 🌐 PASSO 8: Acessar no Navegador

### 8.1 Abrir no Navegador

1. Abra seu navegador (Chrome, Firefox, Edge, etc)
2. Na barra de endereço, digite:
```
http://localhost:3000
```

3. Pressione `Enter`

### 8.2 Você Verá a Página de Login

A página de login deve aparecer com:
- Logo "TKW" em branco
- Título "Tokiwadai Academy"
- Dois abas: "Estudante" e "Administrador"
- Campos de login

✅ Projeto rodando com sucesso!

---

## 🔐 PASSO 9: Fazer Login

### Login como Estudante

1. Clique na aba **"Estudante"**
2. Digite:
   - **ID de Estudante ou Usuário:** `estudante1`
   - **Senha:** `senha123`
3. Clique em **Entrar**
4. Você será redirecionado para o dashboard

### Login como Admin

1. Clique na aba **"Administrador"**
2. Digite:
   - **Usuário Admin:** `admin`
   - **Senha:** `admin123`
3. Clique em **Entrar como Admin**
4. Você será redirecionado para o painel administrativo

### Criar Nova Conta

1. Na aba "Estudante", clique em **"Criar conta"**
2. Preencha o formulário:
   - Nome Completo
   - Nome de Usuário
   - Email
   - Data de Nascimento
   - Série (1-6)
   - Distrito (1-23)
   - Senha
3. Clique em **Criar Conta**
4. Um ID será gerado automaticamente (ex: `TKW-2026-00001`)

---

## 🛠️ Comandos Úteis

### Rodar Testes

1. Abra um **novo terminal** no VS Code (Ctrl + Shift + `)
2. Digite:
```bash
pnpm test
```

3. Você verá:
```
✓ 17 tests passed
```

### Verificar Erros TypeScript

1. No terminal, digite:
```bash
pnpm check
```

### Parar o Servidor

1. No terminal onde o servidor está rodando, pressione: `Ctrl + C`
2. Você verá:
```
^C
```

### Reiniciar o Servidor

1. No terminal, pressione a seta para cima para voltar ao comando anterior
2. Pressione `Enter`
3. Ou digite novamente: `pnpm dev`

---

## 🐛 Troubleshooting

### Problema: "Port 3000 already in use"

**Causa:** Outro programa está usando a porta 3000

**Solução:**
1. Abra o **Prompt de Comando** (CMD) como administrador
2. Digite:
```bash
netstat -ano | findstr :3000
```

3. Você verá um número (PID), por exemplo: `1234`
4. Digite:
```bash
taskkill /PID 1234 /F
```

5. Tente rodar `pnpm dev` novamente

### Problema: "Cannot find module"

**Causa:** Dependências não foram instaladas corretamente

**Solução:**
1. No terminal, pressione `Ctrl + C` para parar o servidor
2. Digite:
```bash
pnpm install
```

3. Aguarde a instalação
4. Digite novamente: `pnpm dev`

### Problema: "MySQL connection error"

**Causa:** MySQL não está rodando ou DATABASE_URL está incorreta

**Solução:**
1. Verifique se MySQL está rodando:
   - Abra **Services** (Win + R, digite `services.msc`)
   - Procure por "MySQL80" (ou versão similar)
   - Se não estiver rodando, clique com botão direito e selecione "Start"

2. Verifique o arquivo `.env`:
   - DATABASE_URL deve ser: `mysql://root:root@localhost:3306/tokiwadai`
   - Ajuste se necessário

3. Tente rodar `pnpm db:push` novamente

### Problema: "pnpm command not found"

**Causa:** pnpm não foi instalado globalmente

**Solução:**
1. No terminal, digite:
```bash
npm install -g pnpm
```

2. Feche e abra o terminal novamente
3. Tente rodar `pnpm dev`

### Problema: Página em branco no navegador

**Causa:** Servidor não iniciou corretamente

**Solução:**
1. Verifique o terminal do VS Code
2. Procure por mensagens de erro (em vermelho)
3. Se houver erro, copie e cole no terminal para ver detalhes
4. Tente parar (Ctrl + C) e rodar novamente: `pnpm dev`

### Problema: Não consegue fazer login

**Causa:** Banco de dados não foi configurado

**Solução:**
1. Verifique se `pnpm db:push` foi executado com sucesso
2. Verifique se MySQL está rodando
3. Tente criar um novo usuário via página de registro

---

## 📱 Acessar de Outro Computador (LAN)

### Encontrar o IP da Máquina

1. Abra o **Prompt de Comando** (CMD)
2. Digite:
```bash
ipconfig
```

3. Procure por "IPv4 Address" (algo como `192.168.x.x`)
4. Copie esse número

### Acessar de Outro Computador

1. No outro computador, abra o navegador
2. Na barra de endereço, digite:
```
http://SEU_IP:3000
```

Exemplo: `http://192.168.1.100:3000`

---
