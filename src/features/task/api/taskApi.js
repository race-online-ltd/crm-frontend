import api from '@/api/config/axiosInstance';

export async function fetchTaskFormOptions() {
  const response = await api.get('/tasks/options');
  return response.data?.data ?? {
    leads: [],
    clients: [],
    task_types: [],
    users: [],
    reminder_channels: [],
  };
}

export async function fetchTasks(params = {}) {
  const response = await api.get('/tasks', { params });
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function fetchTaskCalendar(params = {}) {
  const response = await api.get('/tasks/calendar', { params });
  return response.data?.data ?? [];
}

export async function fetchTaskCalendarFilters() {
  const response = await api.get('/tasks/calendar/filters');
  return response.data?.data ?? {
    business_entities: [],
    teams: [],
    groups: [],
    kams: [],
  };
}

export async function fetchTask(id) {
  const response = await api.get(`/tasks/${id}`);
  return response.data?.data ?? null;
}

export async function createTask(formData) {
  const response = await api.post('/tasks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data ?? null;
}

export async function updateTask(id, formData) {
  const response = await api.put(`/tasks/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data ?? null;
}

export async function checkInTask(id, payload) {
  const response = await api.post(`/tasks/${id}/check-in`, payload);
  return response.data?.data ?? null;
}

export async function completeTask(id, payload) {
  const response = await api.post(`/tasks/${id}/complete`, payload);
  return response.data?.data ?? null;
}

export async function cancelTask(id, payload) {
  const response = await api.post(`/tasks/${id}/cancel`, payload);
  return response.data?.data ?? null;
}

export async function addTaskNote(id, formData) {
  const response = await api.post(`/tasks/${id}/notes`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data?.data ?? null;
}
