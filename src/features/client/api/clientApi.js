import api from '@/api/config/axiosInstance';

export async function fetchClients(params = {}) {
  const response = await api.get('/clients', { params });
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function createClient(payload) {
  const response = await api.post('/clients', payload);
  return response.data?.data;
}

export async function fetchClient(id) {
  const response = await api.get(`/clients/${id}`);
  return response.data?.data ?? null;
}

export async function updateClient(id, payload) {
  const response = await api.put(`/clients/${id}`, payload);
  return response.data?.data;
}

export async function deleteClient(id) {
  const response = await api.delete(`/clients/${id}`);
  return response.data?.message;
}

export async function fetchBusinessEntities() {
  const response = await api.get('/system/business-entities');
  return response.data?.data ?? [];
}

export async function fetchAreas() {
  const response = await api.get('/areas');
  return response.data?.data ?? {
    divisions: [],
    districts: [],
    thanas: [],
  };
}
