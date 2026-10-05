const API_URL = window.PAROQUIA_API_URL || (window.location.hostname.endsWith('onrender.com') ? 'https://paroquia-backend.onrender.com/api' : 'http://localhost:3000/api');
const session = { get token() { return localStorage.getItem('paroquia_token'); }, get user() { try { return JSON.parse(localStorage.getItem('paroquia_user')); } catch { return null; } } };

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (session.token) headers.set('Authorization', `Bearer ${session.token}`);
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await response.text(); let data = {}; try { data = text ? JSON.parse(text) : {}; } catch { data = { erro: text }; }
  if (!response.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.');
  return data;
}
function saveSession(data) { localStorage.setItem('paroquia_token', data.token); localStorage.setItem('paroquia_user', JSON.stringify(data.usuario)); }
function logout() { localStorage.removeItem('paroquia_token'); localStorage.removeItem('paroquia_user'); window.location.href = 'index.html'; }
function requireLogin(admin = false) { if (!session.token || (admin && session.user?.tipo_usuario !== 'admin' && session.user?.role !== 'admin')) window.location.href = 'login.html'; }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function formatDate(value) {
  if (value === null || value === undefined || value === '') return 'Data não informada';
  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const brazilian = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  let year, month, day;
  if (iso) [, year, month, day] = iso;
  else if (brazilian) [, day, month, year] = brazilian;
  if (year) {
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? 'Data inválida' : parsed.toLocaleDateString('pt-BR');
}
document.addEventListener('error', (event) => { if (event.target.tagName === 'IMG' && !event.target.dataset.fallback) { event.target.dataset.fallback = '1'; event.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22360%22%3E%3Crect width=%22600%22 height=%22360%22 fill=%22%23ead8c6%22/%3E%3Ctext x=%22300%22 y=%22180%22 text-anchor=%22middle%22 fill=%22%23563b42%22 font-size=%2224%22%3EParóquia Santa Teresinha%3C/text%3E%3C/svg%3E'; } }, true);
