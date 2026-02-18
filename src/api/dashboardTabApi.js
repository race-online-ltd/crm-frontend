// src/api/settings/mappingApi.js
import { apiClient } from './api-config/config';

// export const fetchDataCenters = async () => {
//   try {
//     const response = await apiClient.get('/settings/data-centers');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const fetchDashboardTabs = async () => {
  try {
    const response = await apiClient.get('/tab/dashboard-tabs');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTabMapping = async (mappingData) => {
  try {
    const response = await apiClient.post('/tab/tab-mappings', mappingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchExistingMappings = async (dataCenterId) => {
  try {
    const response = await apiClient.get(`/tab/tab-mappings?data_center_id=${dataCenterId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSensorThreshold = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/thresholds/by-data-center/${ids}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSensorType = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/sensor-types/by-data-center/${ids}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchStateConfig = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/state/by-data-center/${ids}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDeviceStatus = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/device-status/by-data-center/${ids}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDeviceStatusById = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/device-status/by-device-id/${ids}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
