import { apiClient } from "./api-config/config";


export const SensorLogReport = async (data) => {
  try {
    const response = await apiClient.get('/alarm/report/sensor-log', { params: data });
    return response.data;
  } catch (error) {
    throw error;
  }
};
