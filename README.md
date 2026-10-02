# Paróquia Santa Teresinha

Reconstrução do sistema da paróquia mantendo a divisão `paroquia-backend` / `paroquia-frontend`, o conteúdo principal e o fluxo de intenções, dízimos, eventos e mídias.

## O que mudou

- API Express modularizada em rotas, controllers, serviços, validações e middlewares.
- Senhas protegidas com bcrypt e login com JWT.
- Permissões administrativas aplicadas no backend.
- CRUD administrativo de eventos e mídias.
- Uploads com limite de tamanho e tipos permitidos.
- Validação de entradas com Zod, rate limit no login/cadastro e Helmet.
- Usuários só acessam as próprias intenções e dízimos.
- Banco com índices, timestamps e novas colunas de auditoria.
- Frontend preservando a proposta visual original, agora com chamadas de API centralizadas e painel administrativo em abas.

## Como o sistema funciona

### Visitante

O visitante acessa a página inicial, conhece a padroeira, consulta os párocos, horários das missas, eventos, mídias e canais de contato. Eventos e mídias publicados pela administração aparecem automaticamente nas respectivas seções.

### Paroquiano

O paroquiano cria uma conta e entra com e-mail e senha. Depois do login, pode registrar uma intenção de missa, acompanhar suas próprias intenções, enviar um comprovante de dízimo e consultar o histórico dos seus envios. Cada conta só recebe os próprios registros.

### Administrador

O administrador entra no painel e encontra quatro áreas: gerenciamento de eventos, gerenciamento de mídias, conferência de dízimos e consulta de intenções. O próprio painel contém orientações sobre cada campo, formato dos arquivos e significado dos status.

### Eventos e mídias

Para um evento, informe título, data, texto da data, local e banner. Para uma mídia, informe título, data, link externo e capa. Depois de publicados, os registros são exibidos no site público. A API também possui endpoints de atualização e exclusão para a próxima etapa da interface administrativa.

## Execução

1. Instale Node.js e PostgreSQL.
2. Entre em `paroquia-backend`, copie `.env.example` para `.env` e configure `DATABASE_URL` e `JWT_SECRET`.
3. Execute `database.sql` no banco.
4. Execute `npm install` dentro de `paroquia-backend`.
5. Execute `npm start` dentro de `paroquia-backend`.
6. Sirva `paroquia-frontend` por um servidor estático, como Live Server.

O frontend usa `http://localhost:3000/api` por padrão. Para alterar, defina `window.PAROQUIA_API_URL` antes dos scripts.

## Conta de demonstração

Quando `DATABASE_URL` não está configurada, o backend usa um banco de demonstração em memória e cria automaticamente:

- E-mail: `admin@paroquia.local`
- Senha: `Admin@12345`

Essa conta serve apenas para teste local. Em produção, configure PostgreSQL, altere a senha e defina `JWT_SECRET` no `.env`.

Para uma instalação PostgreSQL já funcionando, use `node scripts/create-admin.js seu@email.com SuaSenhaForte` dentro de `paroquia-backend` para criar ou atualizar o administrador.

O arquivo `render.yaml` contém a configuração inicial para publicar a API e um PostgreSQL no Render. A publicação ainda exige uma conta do Render e a configuração da URL pública do frontend em `FRONTEND_ORIGIN`.

## Observação sobre imagens

As imagens originais devem permanecer na pasta `paroquia-frontend/img`. A interface possui um fallback visual caso algum arquivo ainda não esteja presente.
