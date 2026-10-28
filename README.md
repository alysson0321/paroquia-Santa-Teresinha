<div align="center">

# ⛪ Paróquia Santa Teresinha

### Sistema web para aproximar a comunidade e facilitar a gestão paroquial

Informações da paróquia, intenções de missa, dízimos, eventos e mídias em um só lugar.

[![Acessar aplicação](https://img.shields.io/badge/Acessar%20aplica%C3%A7%C3%A3o-0D5688?style=for-the-badge&logo=googlechrome&logoColor=white)](https://paroquiasantateresinha.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
![Express](https://img.shields.io/badge/Express-222222?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=222222)

</div>

---

## Sobre o projeto

Aplicação para a **Paróquia Santa Teresinha do Menino Jesus**, em Jucati–PE. O site reúne informações da comunidade e oferece fluxos digitais para intenções de missa e envio de comprovantes de dízimo. Uma área administrativa dá suporte ao gerenciamento de eventos, mídias, dízimos e intenções.

## Funcionalidades

| Área | Recursos |
| --- | --- |
| **Site público** | História da padroeira, párocos, horários de missa, eventos, mídias e canais de contato |
| **Conta do paroquiano** | Cadastro e login; registro e consulta das próprias intenções; envio e histórico de comprovantes de dízimo |
| **Administração** | Consulta de intenções, conferência de dízimos e gerenciamento de eventos e mídias |
| **API** | Autenticação JWT, validação de dados, controle de acesso e upload com limites de tamanho e tipo |

> A API já inclui operações de atualização e exclusão para eventos e mídias; essas ações ainda não estão disponíveis no painel administrativo.

## Tecnologias

- **Back-end:** Node.js, Express
- **Banco de dados:** PostgreSQL; modo local de demonstração em memória
- **Autenticação e segurança:** JWT, bcrypt, Zod, Helmet e limite de tentativas
- **Front-end:** HTML, CSS e JavaScript
- **Publicação:** configuração inicial para Render em `render.yaml`

## Estrutura

```text
.
├── paroquia-backend/    # API Express
├── paroquia-frontend/   # Site e painel administrativo
├── database.sql         # Estrutura inicial do PostgreSQL
├── package.json         # Comandos de desenvolvimento e inicialização
└── render.yaml          # Configuração inicial para Render
```

## Executar localmente

### Requisitos

- Node.js
- PostgreSQL para persistência local
- Um servidor estático para servir o front-end, como a extensão Live Server

### 1. Configure a API

Na raiz do repositório:

```bash
cd paroquia-backend
npm install
```

Copie `.env.example` para `.env` e configure os valores locais. Defina uma chave JWT própria e forte. Não publique o arquivo `.env` nem use valores de exemplo em produção.

### 2. Prepare o banco

Crie um banco PostgreSQL e execute o arquivo `database.sql`, localizado na raiz do repositório. Configure `DATABASE_URL` no `.env` da API para apontar para esse banco.

### 3. Inicie a API

Dentro de `paroquia-backend`:

```bash
npm run dev
```

A API inicia na porta definida por `PORT` (por padrão, 3000).

### 4. Sirva o front-end

Abra a pasta `paroquia-frontend` com um servidor estático. O front-end usa `http://localhost:3000/api` por padrão. Se necessário, defina `window.PAROQUIA_API_URL` antes dos scripts do site para apontar para outra URL da API.

### 5. Crie uma conta administrativa

Com PostgreSQL configurado e a API apontando para ele, execute a partir da pasta `paroquia-backend`:

```bash
node scripts/create-admin.js <email> <senha-forte>
```

O modo em memória cria uma conta administrativa automática para demonstração local. Use esse modo apenas na própria máquina; não o exponha como ambiente público.

## Publicação

O arquivo `render.yaml` descreve a API e o PostgreSQL no Render. A publicação também exige configurar as variáveis do serviço e hospedar o front-end em um servidor estático. Defina `FRONTEND_ORIGIN` com a origem pública do front-end e configure `window.PAROQUIA_API_URL` com a URL pública da API.

## Próximos passos

- Adicionar capturas de tela do site e do painel administrativo
- Disponibilizar edição e exclusão de eventos e mídias no painel
- Documentar uma demonstração pública e as etapas de publicação do front-end

---

<div align="center">

Desenvolvido para a comunidade da Paróquia Santa Teresinha · Jucati–PE

[Repositório](https://github.com/alysson0321/paroquia-Santa-Teresinha) · [Perfil de Alysson](https://github.com/alysson0321)

</div>
