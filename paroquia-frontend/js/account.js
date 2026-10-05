requireLogin();

const intentionList = document.querySelector('#lista-intencoes');
const donationList = document.querySelector('#lista-dizimos');
const editDialog = document.querySelector('#modal-edicao');
let editingIntentionId = null;

document.querySelector('#usuario-nome').textContent = session.user?.nome || 'Minha conta';
document.querySelector('#usuario-email').textContent = session.user?.email || '';

function statusLabel(status) {
  const labels = { pendente: 'Em análise', aprovado: 'Aprovado', rejeitado: 'Não aprovado' };
  return labels[status] || status || 'Sem status';
}

async function loadAccountData() {
  try {
    const [intentions, donations] = await Promise.all([
      api('/intencoes'),
      api('/pagamentos_dizimo'),
    ]);

    intentionList.innerHTML = intentions.length
      ? intentions.map((item) => `<article class="account-record">
          <div class="record-copy"><h3>${escapeHtml(item.descricao)}</h3><p>Data da missa: <time datetime="${escapeHtml(String(item.data_missa).slice(0, 10))}">${formatDate(String(item.data_missa).slice(0, 10))}</time></p></div>
          <div class="record-actions"><button type="button" class="secondary" data-edit-intention="${item.id}">Editar</button><button type="button" class="danger" data-delete-intention="${item.id}">Excluir</button></div>
        </article>`).join('')
      : '<p class="empty">Você ainda não registrou intenções de missa.</p>';

    donationList.innerHTML = donations.length
      ? donations.map((item) => `<article class="account-record donation-record">
          <div class="record-copy"><h3>R$ ${Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3><p>Enviado em: <time datetime="${escapeHtml(String(item.data_pagamento).slice(0, 10))}">${formatDate(String(item.data_pagamento).slice(0, 10))}</time></p></div>
          <span class="status-badge status-${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
        </article>`).join('')
      : '<p class="empty">Você ainda não enviou comprovantes de dízimo.</p>';
  } catch (error) {
    const message = `<p class="empty account-error">${escapeHtml(error.message || 'Não foi possível carregar seus dados. Entre novamente na sua conta.')}</p>`;
    intentionList.innerHTML = message;
    donationList.innerHTML = message;
    if (/expirada|inválida|autenticação/i.test(error.message || '')) {
      localStorage.removeItem('paroquia_token');
      window.setTimeout(() => { window.location.href = 'login.html'; }, 1800);
    }
  }
}

intentionList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-intention]');
  const deleteButton = event.target.closest('[data-delete-intention]');
  if (editButton) {
    try {
      const intentions = await api('/intencoes');
      const item = intentions.find((entry) => String(entry.id) === editButton.dataset.editIntention);
      if (!item) return;
      editingIntentionId = item.id;
      document.querySelector('#edit-descricao').value = item.descricao;
      document.querySelector('#edit-data').value = String(item.data_missa).slice(0, 10);
      document.querySelector('#edit-feedback').textContent = '';
      editDialog.showModal();
    } catch (error) {
      alert(error.message);
    }
  }
  if (deleteButton && confirm('Deseja excluir esta intenção de missa?')) {
    deleteButton.disabled = true;
    try {
      await api(`/intencoes/${deleteButton.dataset.deleteIntention}`, { method: 'DELETE' });
      await loadAccountData();
    } catch (error) {
      alert(error.message);
      deleteButton.disabled = false;
    }
  }
});

document.querySelector('#edit-intention-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!editingIntentionId) return;
  const feedback = document.querySelector('#edit-feedback');
  const submit = event.currentTarget.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    await api(`/intencoes/${editingIntentionId}`, {
      method: 'PUT',
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    editDialog.close();
    await loadAccountData();
  } catch (error) {
    feedback.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

document.querySelector('#cancel-edit').addEventListener('click', () => editDialog.close());
document.querySelector('#account-logout').addEventListener('click', logout);
loadAccountData();
