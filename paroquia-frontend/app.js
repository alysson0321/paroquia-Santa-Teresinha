// subir pro git
const API_URL = 'https://paroquia-backend.onrender.com';

// localhost
//const API_URL = 'http://localhost:3000';


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


// seção do registro de usuário
const formRegistro = document.getElementById("form-registro");

if (formRegistro) {
 formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar_senha").value;

  if (senha !== confirmar) {
    const erro = document.querySelector('.erro');
    erro.innerHTML = "As senhas não conferem!";
   return;
  }

  try {
      
   const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha })
   });

   if (!res.ok) throw new Error("Erro no servidor");

   
   window.location.href = "login.html";
  } catch (err) {
   console.error(err);
   alert("Erro ao registrar usuário.");
  }
 });
}


// seção do login de usuário
const formLogin = document.getElementById("form-login");

if (formLogin) {
 formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
      
   const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
   });

   const data = await res.json();

   if (!res.ok) {
    const erro = document.querySelector('.erro');
    erro.innerHTML = (data.erro || "Email ou senha incorretos!");
    return;
   }

   localStorage.setItem("usuario", JSON.stringify({
    id: data.usuario.id,
    nome: data.usuario.nome,
    email: data.usuario.email,
    token: data.token
   }));

   window.location.href = "index.html";
  } catch (error) {
   console.error(error);
   alert("Erro ao conectar com o servidor.");
  }
 });
}


// seção das intenções 
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

   const resu = document.querySelector('.resu');
   resu.innerHTML = "Intenção registrada com sucesso!";
   formIntencao.reset();

  } catch (error) {
   console.error("Erro:", error);
   alert("Erro de conexão com o servidor.");
  }
 });
}


// seção da conta do usuário
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
  
  if (usuario) {
      
   const resIntencoes = await fetch(`${API_URL}/intencoes?usuario_id=${usuario.id}`);
   const intencoes = await resIntencoes.json();

   if (resIntencoes.ok && intencoes.length > 0) {
    listaIntencoes.innerHTML = intencoes.map(i => `
     <p>${new Date(i.data_missa).toLocaleDateString("pt-BR")}: ${i.descricao}</p>
    `).join("");
   } else {
    listaIntencoes.innerHTML = "<p>Nenhuma intenção registrada.</p>";
   }

   
      
   const resDizimos = await fetch(`${API_URL}/pagamentos_dizimo?usuario_id=${usuario.id}`);
   const dizimos = await resDizimos.json();

   if (resDizimos.ok && dizimos.length > 0) {
    listaDizimos.innerHTML = dizimos.map(d => `
     <p>${new Date(d.data_pagamento).toLocaleDateString("pt-BR")} R$ ${d.valor}</p>
    `).join("");
   } else {
    listaDizimos.innerHTML = "<p>Nenhum dízimo registrado.</p>";
   }
  }

 } catch (error) {
  console.error(error);
 }
});