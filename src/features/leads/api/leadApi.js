import api from '@/api/config/axiosInstance';

export async function fetchLeadFormOptions(businessEntityId = '') {
  const response = await api.get('/leads/options', {
    params: businessEntityId ? { business_entity_id: businessEntityId } : {},
  });

  return response.data?.data ?? {
    business_entities: [],
    sources: [],
    clients: [],
    lead_assigns: [],
    kam_users: [],
    backoffices: [],
    products: [],
    stages: [],
  };
}

export async function fetchLeads(params = {}) {
  const response = await api.get('/leads', { params });
  return response.data?.data ?? [];
}

export async function fetchLead(id) {
  const response = await api.get(`/leads/${id}`);
  return response.data?.data ?? null;
}

export async function createLead(formData) {
  const response = await api.post('/leads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data ?? null;
}

export async function updateLead(id, formData) {
  const response = await api.put(`/leads/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data ?? null;
}


export async function fetchLeadPipeline(params = {}) {
  const response = await api.get('/leads/stage-pipeline', { params });
  return response.data?.data ?? {};
}