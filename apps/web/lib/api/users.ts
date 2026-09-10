import { apiRequest } from './client';
import { User } from './types';

export function getUsers() {
  return apiRequest<User[]>('/users');
}

export function updateUserRole(id: string, role: User['role']) {
  return apiRequest<User>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
}
