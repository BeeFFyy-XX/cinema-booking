import { apiPost } from './api.js';

export async function register(name, email, password) {
  const r = await apiPost('/auth/register', { name, email, password });
  localStorage.setItem('token', r.token);
  localStorage.setItem('user', JSON.stringify(r.user));
  return r.user;
}

export async function login(email, password) {
  try {
  const r = await apiPost('/auth/login', { email, password });
  localStorage.setItem('token', r.token);
  localStorage.setItem('user', JSON.stringify(r.user));
  return r.user;
  } catch (err){
    console.error(err);
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function currentUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}
