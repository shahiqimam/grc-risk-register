import { apiRequest } from './client';
import { User } from './types';

export function getUsers() {
  return apiRequest<User[]>('/users');
}
