import { apiClient } from "./api-config/config";

export const getAlarmDetails = async (data) => {
  try {
    const response = await apiClient.post('/alarm/sensor-details', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const acknowledgeAlarmStore = async (data) => {
  try {
    const response = await apiClient.post('/alarm/store', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getAcknowledgeAlarm = async (data) => {
  try {
    const response = await apiClient.post('/alarm/acknowledge', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
