import api from '@/api/config/axiosInstance';

export async function fetchRoles() {
  const response = await api.get('/system/roles');
  return response.data?.data ?? [];
}

export async function createRole(payload) {
  const response = await api.post('/system/roles', payload);
  return response.data?.data;
}

export async function fetchSystemUsers() {
  const response = await api.get('/system/users');
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function fetchSystemUsersPaginated(params = {}) {
  const response = await api.get('/system/users', { params });
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function createSystemUser(payload) {
  const response = await api.post('/system/users', payload);
  return response.data?.data;
}

export async function updateSystemUser(id, payload) {
  const response = await api.put(`/system/users/${id}`, payload);
  return response.data?.data;
}
