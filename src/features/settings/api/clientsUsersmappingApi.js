import api from '@/api/config/axiosInstance';

export async function fetchClientsByBusinessEntity(payload) {
  const response = await api.post('/user-mappings/clients/by-business-entity', payload);
  return response.data?.data;
}



export async function fetchDivisions() {
  const response = await api.get('/user-mappings/divisions');
  return response.data?.data ?? [];
}


export async function storeUserMappings(payload) {
  const response = await api.post('/user-mappings/store', payload);
  return response.data?.data;
}

export async function getUserMappings(userId) {
  const response = await api.get(`/user-mappings/${userId}`);
  return response.data?.data;
}
