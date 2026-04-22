import api from '../../../api/config/axiosInstance';

function toIsoString(value) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export async function getMeetingRecorderLaunchUrl(task = {}) {
  const response = await api.post('/integrations/meeting-recorder/launch', {
    task: {
      id: task.id || '',
      taskType: task.taskType || '',
      title: task.title || '',
      lead: task.lead || '',
      client: task.client || '',
      scheduledAt: toIsoString(task.scheduledAt),
    },
  });

  return response.data?.data?.launch_url || '';
}

