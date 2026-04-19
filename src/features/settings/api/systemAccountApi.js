import api from '@/api/config/axiosInstance';

export async function fetchExternalSystemsForAccountConnection() {
  const response = await api.get('/system/external-systems');
  const data = response.data?.data ?? [];

  return data.map((externalSystem) => ({
    id: String(externalSystem.id),
    label: externalSystem.external_system_name,
  }));
}

export async function fetchExternalUsersForSystem(externalSystemId) {
  const response = await api.get(`/system/external-systems/${externalSystemId}/users`);
  const data = response.data?.data ?? [];

  return data.map((user) => ({
    id: String(user.id),
    label: user.label,
  }));
}

export async function fetchSystemAccountConnections(systemUserId) {
  const response = await api.get(`/system/users/${systemUserId}/external-account-connections`);
  return response.data?.data ?? [];
}

export async function saveSystemAccountConnections(systemUserId, payload) {
  const response = await api.post(`/system/users/${systemUserId}/external-account-connections`, payload);
  return response.data;
}
