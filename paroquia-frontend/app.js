//const API_URL = "http://localhost:3000";
const API_URL = "https://paroquia-backend.onrender.com";

(async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // mostrar link admin se for admin
  const linkAdmin = document.getElementById("link-admin");
  if (linkAdmin && usuario && usuario.tipo_usuario === "admin") {
    linkAdmin.style.display = "block"; 
  }

  // menu lateral
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("menu-overlay");
  const menuClose = document.getElementById("menu-close");

  if (menuToggle && sidebar && overlay) {
    function openMenu() {
      sidebar.classList.add("open");
      overlay.classList.add("visible");
    }
    function closeMenu() {
      sidebar.classList.remove("open");
      overlay.classList.remove("visible");
    }
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      openMenu();
    });
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
    sidebar.addEventListener("click", (e) => {
      if (e.target.tagName === "A") closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) closeMenu();
    });
  }

  // seção da conta do usuário
  const nomeEl = document.getElementById("usuario-nome");
  if (nomeEl) {
    const emailEl = document.getElementById("usuario-email");
    const listaIntencoes = document.getElementById("lista-intencoes");
    const listaDizimos = document.getElementById("lista-dizimos");

    if (usuario) {
      nomeEl.textContent = usuario.nome;
      emailEl.textContent = usuario.email;
    }
    try {
      if (usuario) {
        const resIntencoes = await fetch(
          `${API_URL}/intencoes?usuario_id=${usuario.id}`
        );
        const intencoes = await resIntencoes.json();
        if (resIntencoes.ok && intencoes.length > 0) {
          listaIntencoes.innerHTML = intencoes
            .map(
              (i) => `
            <div class="intencao-item" id="intencao-${i.id}">
              <p>${new Date(i.data_missa).toLocaleDateString("pt-BR")}: ${
                i.descricao
              }</p>
              <button onclick="removerIntencao(${
                i.id
              })" class="btn-remover">🗑️</button>
            </div>
          `
            )
            .join("");
        } else {
          listaIntencoes.innerHTML = "<p>Nenhuma intenção registrada.</p>";
        }
        const resDizimos = await fetch(
          `${API_URL}/pagamentos_dizimo?usuario_id=${usuario.id}`
        );
        const dizimos = await resDizimos.json();
        if (resDizimos.ok && dizimos.length > 0) {
          listaDizimos.innerHTML = dizimos
            .map(
              (d) =>
                `<p>${new Date(d.data_pagamento).toLocaleDateString(
                  "pt-BR"
                )} R$ ${d.valor}</p>`
            )
            .join("");
        } else {
          listaDizimos.innerHTML = "<p>Nenhum dízimo registrado.</p>";
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da conta:", error);
    }
  }

  // index.html - carregar eventos e mídias
  const listaEventosEl = document.getElementById("lista-eventos");
  if (listaEventosEl) {
    try {
      const res = await fetch(`${API_URL}/eventos`);
      if (!res.ok) throw new Error("Erro ao buscar eventos");
      const eventos = await res.json();
      if (eventos.length > 0) {
        listaEventosEl.innerHTML = "";
        eventos.forEach((evento) => {
          const bannerSrc = evento.banner.startsWith("http")
            ? evento.banner
            : `${API_URL}/${evento.banner}`;
          listaEventosEl.innerHTML += `
            <div class="evento">
              <img src="${bannerSrc}" alt="${evento.titulo}">
              <p>${evento.titulo}<br>${evento.data_texto}<br> <small style="color: #d4a017;">${evento.local}</small></p>
            </div>`;
        });
      } else {
        listaEventosEl.innerHTML = "<p>Nenhum evento futuro cadastrado.</p>";
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      listaEventosEl.innerHTML = "<p>Não foi possível carregar os eventos.</p>";
    }
  }

  const listaMidiasEl = document.getElementById("lista-midias");
  if (listaMidiasEl) {
    try {
      const res = await fetch(`${API_URL}/midias`);
      if (!res.ok) throw new Error("Erro ao buscar mídias");
      const midias = await res.json();
      if (midias.length > 0) {
        listaMidiasEl.innerHTML = "";
        midias.forEach((midia) => {
          const bannerSrc = midia.banner.startsWith("http")
            ? midia.banner
            : `${API_URL}/${midia.banner}`;
          listaMidiasEl.innerHTML += `
            <div class="midia">
              <img src="${bannerSrc}" alt="${midia.titulo}">
              <p>${midia.titulo}<br>
                <span style="color: #d4a017;">${new Date(
                  midia.data_evento
                ).toLocaleDateString("pt-BR")}</span><br>
                <a href="${
                  midia.link_externo
                }" target="_blank">Acesse as mídias</a>
              </p>
            </div>`;
        });
      } else {
        listaMidiasEl.innerHTML = "<p>Nenhuma mídia cadastrada.</p>";
      }
    } catch (error) {
      console.error("Erro ao carregar mídias:", error);
      listaMidiasEl.innerHTML = "<p>Não foi possível carregar as mídias.</p>";
    }
  }
})(); 

// seção do registro do usuário
const formRegistro = document.getElementById("form-registro");
if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar_senha").value;
    const erroEl = formRegistro.querySelector(".erro");
    if (senha !== confirmar) {
      erroEl.innerHTML = "As senhas não conferem!";
      return;
    }
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro no servidor");
      }
      window.location.href = "login.html";
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      erroEl.innerHTML = "Erro ao registrar usuário.";
    }
  });
}

// seção do login do usuário
const formLogin = document.getElementById("form-login");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const erroEl = formLogin.querySelector(".erro");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        erroEl.innerHTML = data.erro || "Email ou senha incorretos!";
        return;
      }
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: data.usuario.id,
          nome: data.usuario.nome,
          email: data.usuario.email,
          tipo_usuario: data.usuario.tipo_usuario,
          token: data.token,
        })
      );
      window.location.href = "index.html";
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      erroEl.innerHTML = "Erro ao conectar com o servidor.";
    }
  });
}

// cadastrar intenção
const formIntencao = document.getElementById("form-intencao");
if (formIntencao) {
  formIntencao.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const descricao = document.getElementById("intencao").value.trim();
    const data_missa = document.getElementById("data_missa").value;
    const resuEl = formIntencao.querySelector(".resu");
    if (!descricao || !data_missa) {
      resuEl.innerHTML = "Preencha todos os campos.";
      resuEl.style.color = "red";
      return;
    }
    try {
      const res = await fetch(`${API_URL}/intencoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario ? usuario.id : null,
          descricao,
          data_missa,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        resuEl.innerHTML = data.erro || "Erro ao registrar intenção.";
        resuEl.style.color = "red";
        return;
      }
      resuEl.innerHTML = "Intenção registrada com sucesso!";
      resuEl.style.color = "green";
      formIntencao.reset();
    } catch (error) {
      console.error("Erro:", error);
      resuEl.innerHTML = "Erro de conexão com o servidor.";
      resuEl.style.color = "red";
    }
  });
}

// página do admin - add eventos e mídias
const formEventoAdmin = document.getElementById("form-evento-admin");
const feedbackEl = document.getElementById("admin-feedback");

if (formEventoAdmin) {
  formEventoAdmin.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (feedbackEl) feedbackEl.innerHTML = "";
    try {
      const formData = new FormData();
      formData.append("titulo", document.getElementById("evento-titulo").value);
      formData.append(
        "data_inicio",
        document.getElementById("evento-data-inicio").value
      );
      formData.append(
        "data_texto",
        document.getElementById("evento-data-texto").value
      );
      formData.append("local", document.getElementById("evento-local").value);
      const inputBanner = document.getElementById("evento-banner");
      if (inputBanner.files.length === 0) {
        throw new Error("Por favor, selecione uma imagem para o banner.");
      }
      formData.append("banner_arquivo", inputBanner.files[0]);

      const res = await fetch(`${API_URL}/eventos`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.erro || "Erro do servidor.");
      }
      const data = await res.json();
      if (feedbackEl) {
        feedbackEl.innerHTML = `<p style="color: green;">${data.mensagem}</p>`;
      }
      formEventoAdmin.reset();
    } catch (err) {
      console.error("Erro ao cadastrar evento:", err);
      if (feedbackEl) {
        feedbackEl.innerHTML = `<p style="color: red;">${err.message}</p>`;
      }
    }
  });
}

const formMidiaAdmin = document.getElementById("form-midia-admin");
if (formMidiaAdmin) {
  formMidiaAdmin.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (feedbackEl) feedbackEl.innerHTML = "";
    try {
      const formData = new FormData();
      formData.append("titulo", document.getElementById("midia-titulo").value);
      formData.append(
        "data_evento",
        document.getElementById("midia-data").value
      );
      formData.append(
        "link_externo",
        document.getElementById("midia-link").value
      );
      const inputMidia = document.getElementById("midia-banner");
      if (inputMidia.files.length === 0) {
        throw new Error(
          "Por favor, selecione uma imagem para a capa da mídia."
        );
      }
      formData.append("midia_arquivo", inputMidia.files[0]);

      const res = await fetch(`${API_URL}/midias`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.erro || "Erro do servidor.");
      }
      const data = await res.json();
      if (feedbackEl) {
        feedbackEl.innerHTML = `<p style="color: green;">${data.mensagem}</p>`;
      }
      formMidiaAdmin.reset();
    } catch (err) {
      console.error("Erro ao cadastrar mídia:", err);
      if (feedbackEl) {
        feedbackEl.innerHTML = `<p style="color: red;">${err.message}</p>`;
      }
    }
  });
}

// remover intenção
async function removerIntencao(idDaIntencao) {
  if (!confirm("Tem certeza de que deseja remover esta intenção?")) {
    return;
  }
  try {
    const res = await fetch(`${API_URL}/intencoes/${idDaIntencao}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      let erroMsg = `Erro ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        erroMsg = errorData.erro || erroMsg;
      } catch (e) {}
      throw new Error(erroMsg);
    }
    const data = await res.json();
    const elementoParaRemover = document.getElementById(
      `intencao-${idDaIntencao}`
    );
    if (elementoParaRemover) {
      elementoParaRemover.remove();
    }
    const listaIntencoes = document.getElementById("lista-intencoes");
    if (listaIntencoes.children.length === 0) {
      listaIntencoes.innerHTML = "<p>Nenhuma intenção registrada.</p>";
    }
  } catch (error) {
    console.error("Erro ao remover intenção:", error);
    alert(error.message);
  }
}
