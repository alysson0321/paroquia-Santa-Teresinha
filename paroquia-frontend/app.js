// <-- MUDANÇA AQUI: Defina a URL do seu backend (Web Service) do Render
// Esta URL será algo como: https://paroquia-backend.onrender.com
const API_URL = 'https://paroquia-backend.onrender.com/';


// menu lateral da pag incial 
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('menu-overlay');
  const menuClose = document.getElementById('menu-close');

  if (menuToggle && sidebar && overlay) {
    function openMenu() {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
      sidebar.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      sidebar.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenu();
    });

    if (menuClose) menuClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    sidebar.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closeMenu();
    });
  }
});


// ==================== REGISTRO ====================
const formRegistro = document.getElementById("form-registro");

if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar_senha").value;

    if (senha !== confirmar) {
      alert("As senhas não conferem!");
      return;
    }

    try {
      // <-- MUDANÇA AQUI
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
      });

      if (!res.ok) throw new Error("Erro no servidor");

      const data = await res.json();
      alert(data.mensagem || "Usuário cadastrado com sucesso!");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar usuário.");
    }
  });
}


// ==================== LOGIN ====================
const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      // <-- MUDANÇA AQUI
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || "Email ou senha incorretos!");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify({
        id: data.usuario.id,
        nome: data.usuario.nome,
        email: data.usuario.email,
        token: data.token
      }));

      alert("Login realizado com sucesso!");
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor.");
    }
  });
}


// ==================== INTENÇÕES DE MISSA ====================
const formIntencao = document.getElementById("form-intencao");

if (formIntencao) {
  formIntencao.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const descricao = document.getElementById("intencao").value.trim();
    const data_missa = document.getElementById("data_missa").value;

    if (!descricao || !data_missa) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // <-- MUDANÇA AQUI
      const res = await fetch(`${API_URL}/intencoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario ? usuario.id : null,
          descricao,
          data_missa
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.erro || "Erro ao registrar intenção.");
        return;
      }

      alert("Intenção registrada com sucesso!");
      formIntencao.reset();

    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão com o servidor.");
    }
  });
}


// ==================== PÁGINA DE PERFIL ====================
document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nomeEl = document.getElementById("usuario-nome");
  const emailEl = document.getElementById("usuario-email");
  const listaIntencoes = document.getElementById("lista-intencoes");
  const listaDizimos = document.getElementById("lista-dizimos");

  if (usuario) {
    nomeEl.textContent = usuario.nome;
    emailEl.textContent = usuario.email;
  }

  try {
    // Buscar intenções do usuário
    if (usuario) {
      // <-- MUDANÇA AQUI
      const resIntencoes = await fetch(`${API_URL}/intencoes?usuario_id=${usuario.id}`);
      const intencoes = await resIntencoes.json();

      if (resIntencoes.ok && intencoes.length > 0) {
        listaIntencoes.innerHTML = intencoes.map(i => `
          <p>${new Date(i.data_missa).toLocaleDateString("pt-BR")}: ${i.descricao}</p>
        `).join("");
      } else {
        listaIntencoes.innerHTML = "<p>Nenhuma intenção registrada.</p>";
      }

      // Buscar dízimos
      // <-- MUDANÇA AQUI
      const resDizimos = await fetch(`${API_URL}/pagamentos_dizimo?usuario_id=${usuario.id}`);
      const dizimos = await resDizimos.json();

      if (resDizimos.ok && dizimos.length > 0) {
        listaDizimos.innerHTML = dizimos.map(d => `
          <p>${new Date(d.data_pagamento).toLocaleDateString("pt-BR")} R$ ${d.valor}</p>
        `).join("");
      } else {
        listaDizimos.innerHTML = "<p>Nenhum dízimo registrado.</p>";
T      }
    }

  } catch (error) {
    console.error(error);
    alert("Erro ao carregar informações do usuário.");
  }
});