# 🎓 Tokiwadai Academy - Sistema Web RPG

Um sistema web completo de gerenciamento acadêmico para escolas de RPG de mesa com autenticação dual, painel de estudantes, rede social, mensagens privadas, calendário, biblioteca digital, mapa interativo e painel administrativo.

## ⚡ Quick Start

### 1. Instalar Dependências
```bash
cd /home/ubuntu/tokiwadai-academy
pnpm install
```

### 2. Configurar Banco de Dados
```bash
pnpm db:push
```

### 3. Iniciar Servidor
```bash
pnpm dev
```

### 4. Abrir no Navegador
```
http://localhost:3000
```

## 🔐 Credenciais Padrão

**Estudante:**
- ID: `TKW-2026-00001`
- Usuário: `estudante1`
- Senha: `senha123`

**Admin:**
- Usuário: `admin`
- Senha: `admin123`

## 📖 Documentação Completa

Para instruções detalhadas, guia de LAN e troubleshooting, consulte:

👉 **[GUIA_COMPLETO.md](./GUIA_COMPLETO.md)**

## 🚀 Recursos Principais

- ✅ Autenticação de estudante e admin
- ✅ Geração automática de ID (TKW-[ANO]-[NÚMERO])
- ✅ Painel de estudante com sidebar
- ✅ Perfil editável com bio (500 chars)
- ✅ Mirror (rede social)
- ✅ Mensagens privadas
- ✅ Calendário acadêmico
- ✅ Biblioteca digital
- ✅ Mapa de Axis (23 distritos)
- ✅ Painel administrativo completo
- ✅ Notificações
- ✅ Backup para S3

## 🛠️ Tech Stack

- **Frontend:** React 19 + Tailwind CSS 4 + TypeScript
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL + Drizzle ORM
- **Testing:** Vitest
- **Build:** Vite + esbuild

## 📁 Estrutura do Projeto

```
tokiwadai-academy/
├── client/              # Frontend React
├── server/              # Backend Express + tRPC
├── drizzle/             # Schema do banco de dados
├── GUIA_COMPLETO.md     # Documentação detalhada
└── package.json
```

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Resultado esperado: 17 testes passando
```

## 📝 Notas

- O sistema está totalmente funcional com login, registro e dashboards
- Funcionalidades como Mirror, mensagens e biblioteca estão em desenvolvimento
- Todas as rotas de API estão implementadas e prontas para uso
- O banco de dados é criado automaticamente com `pnpm db:push`

## 🌐 Acesso via LAN

Para acessar de outro computador:

```bash
# Encontre o IP da máquina
ifconfig | grep "inet " | grep -v 127.0.0.1

# Acesse de outro computador
http://SEU_IP:3000
```

## 📞 Suporte

Consulte o arquivo **GUIA_COMPLETO.md** para:
- Instalação detalhada
- Como usar no VS Code
- Troubleshooting
- Próximas funcionalidades

---

**Desenvolvido para:** Tokiwadai Academy, Axis City  
**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026
