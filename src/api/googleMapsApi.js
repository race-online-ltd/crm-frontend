import api from './config/axiosInstance';

export async function fetchGoogleMapsConfig() {
  const response = await api.get('/system/google-maps-config');
  return response.data?.data ?? {
    enabled: false,
    browser_api_key: '',
  };
}
