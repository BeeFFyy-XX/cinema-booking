const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:4000/api';

function authHeader() {
  const t = localStorage.getItem('token');
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

export async function apiGet(path) {
  const r = await fetch(API_BASE + path, { headers: { ...authHeader() } });
  if (!r.ok) throw new Error('Request failed: ' + r.status);
  return r.json();
}

export async function apiPost(path, body) {
  const r = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body || {})
  });
  const data = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(data.error || ('Request failed: ' + r.status));
  return data;
}

export async function apiPut(path, body) {
  const r = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body || {})
  });
  const data = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(data.error || ('Request failed: ' + r.status));
  return data;
}

export async function apiDelete(path) {
  const r = await fetch(API_BASE + path, {
    method: 'DELETE',
    headers: { ...authHeader() }
  });
  const data = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(data.error || ('Request failed: ' + r.status));
  return data;
}

export function setApiBase(url) { localStorage.setItem('apiBase', url); }
