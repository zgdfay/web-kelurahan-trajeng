import { ServiceApplication, UserAccount, ServiceStatus } from '../types';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

// ==============================
// USERS API
// ==============================

export async function apiGetUsers(): Promise<UserAccount[]> {
  const res = await fetch(`${API_BASE_URL}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function apiRegisterUser(user: UserAccount): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to register user');
}

export async function apiUpdateUser(user: UserAccount): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to update user');
}

export async function apiDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete user');
}



// ==============================
// APPLICATIONS API
// ==============================

export async function apiGetApplications(): Promise<ServiceApplication[]> {
  const res = await fetch(`${API_BASE_URL}/applications`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function apiAddApplication(app: ServiceApplication): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(app)
  });
  if (!res.ok) throw new Error('Failed to submit application');
}

export async function apiUpdateApplicationStatus(id: string, status: ServiceStatus, keterangan: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, keterangan })
  });
  if (!res.ok) throw new Error('Failed to update application status');
}
