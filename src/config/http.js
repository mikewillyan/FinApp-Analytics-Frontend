import { API_URL } from './api';
import { getAccessToken, setAccessToken, clearAccessToken } from './auth';

function getCookie(name) {
  try {
    return document.cookie
      .split('; ')
      .find(r => r.startsWith(name + '='))
      ?.split('=')[1] || '';
  } catch (_) { return ''; }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  // incluir CSRF header se existir cookie (compatível com futura proteção double-submit)
  const csrf = getCookie('csrf_token');
  if (csrf && !headers.has('x-csrf-token')) headers.set('x-csrf-token', csrf);

  let resp = await fetch(url, { ...options, headers, credentials: options.credentials ?? 'include' });
  if (resp.status !== 401) return resp;

  // tenta refresh
  const refresh = await fetch(`${API_URL}/usuario/refresh`, { method: 'POST', credentials: 'include', headers: csrf ? { 'x-csrf-token': csrf } : undefined });
  if (!refresh.ok) {
    clearAccessToken();
    return resp;
  }
  const data = await refresh.json().catch(() => ({}));
  if (!data?.accessToken) {
    clearAccessToken();
    return resp;
  }
  setAccessToken(data.accessToken);

  // repete a chamada original com novo token
  const retryHeaders = new Headers(options.headers || {});
  retryHeaders.set('Authorization', `Bearer ${data.accessToken}`);
  if (csrf && !retryHeaders.has('x-csrf-token')) retryHeaders.set('x-csrf-token', csrf);
  return fetch(url, { ...options, headers: retryHeaders, credentials: options.credentials ?? 'include' });
}


