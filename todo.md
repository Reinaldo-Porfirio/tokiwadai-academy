# Tokiwadai Academy - TODO List

## Banco de Dados
- [x] Criar schema completo com Drizzle (users, admins, posts, likes, comments, messages, events, library, settings)
- [x] Implementar migrations e push para banco de dados

## Autenticação
- [x] Sistema de login de estudante (ID/username + senha)
- [x] Sistema de login de administrador (username + senha master)
- [x] Geração automática de ID no formato TKW-[ANO]-[NÚMERO]
- [x] Hash seguro de senhas com bcrypt
- [x] Proteção contra SQL injection e XSS

## Registro de Estudantes
- [x] Formulário de registro com validação
- [ ] Upload de foto de perfil (com avatar padrão)
- [x] Validação de email único e username único
- [ ] Seed data com admin padrão e estudantes exemplo

## Painel do Estudante
- [x] Sidebar de navegação com ícones
- [x] Página de perfil com informações pessoais
- [ ] Edição de perfil (foto, bio, senha)
- [x] Bio com limite de 500 caracteres (implementado no schema)

## Mirror (Rede Social)
- [ ] Feed cronológico reverso com posts
- [ ] Criar posts com texto (máx 500 chars) + imagem opcional
- [ ] Sistema de likes (1 por usuário)
- [ ] Comentários expandíveis em posts
- [ ] Deletar próprios posts
- [ ] Busca por autor e hashtags
- [ ] Contador de likes e comentários

## Mensagens Privadas
- [ ] Lista de conversas
- [ ] Área de chat com histórico
- [ ] Enviar mensagens entre estudantes
- [ ] Busca por nome/ID de estudante
- [ ] Notificação de mensagens não lidas
- [ ] Marcar como lido

## Calendário Acadêmico
- [ ] Visualização de calendário mensal
- [ ] Tipos de eventos: Aula, Prova, Feriado, Evento Especial
- [ ] Admin pode criar/editar/deletar eventos
- [ ] Estudantes visualizam eventos
- [ ] Exibição de hora (opcional) e descrição

## Biblioteca Digital
- [ ] Upload de arquivos (PDF, imagens) por admin
- [ ] Categorias: Material de Aula, Regulamentos, Mapas, Outros
- [ ] Download de arquivos
- [ ] Sistema de busca
- [ ] Editar nome/descrição de arquivos

## Mapa da Cidade
- [ ] Upload de imagem do mapa por admin
- [ ] Visualização com zoom e pan
- [ ] Representação de 23 distritos
- [ ] Apenas admin pode editar

## Painel Administrativo
- [ ] Dashboard com estatísticas (total estudantes, posts, último cadastro)
- [ ] CRUD completo de estudantes
- [ ] Criar estudantes NPC
- [ ] Editar dados de estudante
- [ ] Deletar estudante (com confirmação)
- [ ] Suspender/reativar conta
- [ ] Resetar senha de estudante
- [ ] Moderação do Mirror (deletar posts/comentários)
- [ ] Gerenciamento de calendário
- [ ] Gerenciamento de biblioteca
- [ ] Gerenciamento de mapa
- [ ] Configurações do sistema (nome escola, ano letivo, logo, cores)

## Sistema de Notificações
- [ ] Notificações de mensagens privadas não lidas
- [ ] Notificações de novos eventos no calendário
- [ ] Notificações de likes/comentários em posts
- [ ] Centro de notificações no painel do estudante
- [ ] Marcar notificações como lidas

## Upload de Arquivos
- [ ] Validação de tipo de arquivo
- [ ] Limites de tamanho (imagens 5MB, docs 20MB)
- [ ] Organização em pastas (profiles, posts, library, system)
- [ ] Integração com S3 para armazenamento

## Backup e Armazenamento
- [ ] Backup automático de banco de dados
- [ ] Backup de arquivos para S3
- [ ] Agendamento configurável de backups
- [ ] Restauração de backups

## Frontend - Páginas
- [x] Página de login (estudante e admin)
- [x] Página de registro de estudante
- [x] Dashboard do estudante
- [ ] Página de perfil (detalhada)
- [ ] Página do Mirror
- [ ] Página de mensagens
- [ ] Página de calendário
- [ ] Página de biblioteca
- [ ] Página de mapa
- [ ] Página de configurações
- [x] Dashboard administrativo
- [ ] Página de gerenciamento de estudantes
- [ ] Página de moderação
- [ ] Página de configurações admin

## Frontend - Design
- [ ] Design futurista com cores frias (azul, prata, branco)
- [ ] Interface responsiva (desktop e mobile)
- [ ] Tema claro/escuro (opcional)
- [ ] Logo placeholder da Tokiwadai Academy
- [ ] Ícones para sidebar
- [ ] Componentes reutilizáveis

## Testes
- [x] Testes unitários para autenticação
- [x] Testes para geração de ID de estudante
- [ ] Testes para CRUD de estudantes
- [ ] Testes para Mirror (posts, likes, comentários)
- [ ] Testes para mensagens privadas

## Documentação
- [ ] README.md com instruções de instalação
- [ ] Como rodar servidor local
- [ ] Como acessar de outros dispositivos na rede
- [ ] Credenciais admin padrão
- [ ] Como fazer backup
- [ ] Documentação de API (endpoints)
- [ ] Guia passo a passo para VS Code
- [ ] Instruções de acesso para jogadores (link/IP)

## Deploy e Publicação
- [ ] Criar checkpoint final
- [ ] Publicar projeto
