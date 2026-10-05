document.addEventListener('DOMContentLoaded', () => {
  const sidebar=document.querySelector('#sidebar'), overlay=document.querySelector('#menu-overlay');
  document.querySelector('#menu-toggle')?.addEventListener('click',()=>{sidebar.classList.add('open');overlay.classList.add('open');}); document.querySelector('#menu-close')?.addEventListener('click',closeMenu); overlay?.addEventListener('click',closeMenu);
  function closeMenu(){sidebar?.classList.remove('open');overlay?.classList.remove('open');}
  if(session.user?.tipo_usuario==='admin') document.querySelector('#link-admin')?.style.removeProperty('display');
  if(session.token){document.querySelector('#link-account')?.style.removeProperty('display');document.querySelector('#link-login')?.style.setProperty('display','none');document.querySelector('#link-logout')?.style.removeProperty('display');}
  document.querySelector('#logout, #link-logout')?.addEventListener('click',(event)=>{event.preventDefault();logout();});
  loadPublicContent();
});
async function loadPublicContent(){
  const events=document.querySelector('#lista-eventos'), media=document.querySelector('#lista-midias'); if(!events&&!media)return;
  try { const [eventData,mediaData]=await Promise.all([api('/eventos'),api('/midias')]);
    if(events) events.innerHTML=eventData.length?eventData.map(e=>`<article class="card"><img src="${e.banner}" alt="${escapeHtml(e.titulo)}"><div class="card-body"><h3>${escapeHtml(e.titulo)}</h3><p>${escapeHtml(e.data_texto)}</p><p class="muted">${formatDate(e.data_inicio)} · ${escapeHtml(e.local)}</p></div></article>`).join(''):'<p class="empty">Nenhum evento cadastrado.</p>';
    if(media) media.innerHTML=mediaData.length?mediaData.map(m=>`<article class="card"><img src="${m.banner}" alt="${escapeHtml(m.titulo)}"><div class="card-body"><h3>${escapeHtml(m.titulo)}</h3><p class="muted">${formatDate(m.data_evento)}</p><a class="button" href="${m.link_externo}" target="_blank" rel="noopener">Ver mídia</a></div></article>`).join(''):'<p class="empty">Nenhuma mídia cadastrada.</p>';
  } catch(error){ const message='O conteúdo será exibido assim que a conexão com a secretaria estiver disponível.'; if(events)events.innerHTML=`<p class="empty">${message}</p>`; if(media)media.innerHTML=`<p class="empty">${message}</p>`; }
}
