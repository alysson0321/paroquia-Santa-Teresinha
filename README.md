# Site da Paróquia Santa Teresinha do Menino Jesus ⛪

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-brightgreen)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## 📖 Sobre o Projeto

Este projeto é um sistema web desenvolvido como Projeto Profissional Orientado (PPO) para o curso Técnico em Informática do IFPE - Campus Garanhuns.

O objetivo principal é modernizar a comunicação e os serviços da **Paróquia Santa Teresinha do Menino Jesus** (Jucati-PE), centralizando informações e facilitando processos que antes eram manuais. O sistema permite que fiéis cadastrem intenções de missa e realizem dízimos online, além de oferecer um painel administrativo para a gestão paroquial.

**Link do Projeto no Ar:** [https://paroquiasantateresinha.onrender.com](https://paroquiasantateresinha.onrender.com)

## 🚀 Funcionalidades

O sistema possui dois níveis de acesso: **Paroquiano** e **Administrador**.

### 👤 Paroquiano (Fiel)
- **Cadastro e Login:** Acesso seguro ao sistema.
- **Intenções de Missa:** Cadastrar, editar, visualizar e remover intenções para datas específicas.
- **Dízimo Online:** Realizar contribuições e visualizar histórico.
- **Informações:** Visualizar horários de missas, eventos e avisos.

### 🛡️ Administrador (Secretaria/Pároco)
- **Gestão de Conteúdo:** Cadastrar e atualizar banners e avisos.
- **Controle de Intenções:** Visualizar e organizar as intenções por data.
- **Validação:** Conferir e gerenciar registros de dízimos e usuários.

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando a arquitetura MVC:

* **Front-end:** HTML5, CSS3 (Responsivo) e JavaScript.
* **Back-end:** Node.js com Express.
* **Banco de Dados:** PostGreSQL.
* **Ferramentas:** Git, VS Code e Figma (Prototipagem).

## ⚙️ Como Rodar o Projeto Localmente

### Pré-requisitos
* Node.js instalado.
* PostGreSQL instalado e rodando.
* Git instalado.

### Passo a passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/alysson0321/paroquia-Santa-Teresinha.git](https://github.com/alysson0321/paroquia-Santa-Teresinha.git)
    ```

2.  **Acesse a pasta:**
    ```bash
    cd paroquia-Santa-Teresinha
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure o Banco de Dados:**
    * Crie um arquivo `.env` na raiz do projeto.
    * Configure as variáveis de conexão (exemplo):
    ```env
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASS=sua_senha
    DB_NAME=nome_do_banco
    ```
    * Execute o script SQL disponível em `database.sql` para criar as tabelas.

5.  **Execute o servidor:**
    ```bash
    npm start
    ```

6.  **Acesse:** Abra o navegador em `http://localhost:3000`.

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

## 👨‍💻 Autor

**Alysson Felipe Matias da Silva**
* **LinkedIn:** [Alysson Felipe](https://www.linkedin.com/in/alysson-felipe-b456a92a7/)
* **GitHub:** [@alysson0321](https://github.com/alysson0321)

---
*Projeto desenvolvido sob orientação da Profa. Me. Alessandra Maranhão Soares Sivini Siqueira - IFPE 2025.*
