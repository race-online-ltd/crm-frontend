import api from '@/api/config/axiosInstance';

export async function fetchTargets(params = {}) {
  const response = await api.get('/target', { params });
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function fetchTarget(id) {
  const response = await api.get(`/target/${id}`);
  return response.data?.data ?? null;
}

export async function createTarget(payload) {
  const response = await api.post('/target', payload);
  return response.data?.data ?? null;
}

export async function updateTarget(id, payload) {
  const response = await api.put(`/target/${id}`, payload);
  return response.data?.data ?? null;
}

export async function deleteTarget(id) {
  const response = await api.delete(`/target/${id}`);
  return response.data?.message ?? '';
}
