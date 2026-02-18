import { apiClient } from '../api-config/config';

export const createDataCenter = async (payload) => {
  try {
    const response = await apiClient.post('/data-centers', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDataCenter = async (id) => {
  try {
    const response = await apiClient.delete(`/data-centers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDataCenter = async (id, data) => {
  try {
    const response = await apiClient.put(`/data-centers/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDataCenter = async (id) => {
  try {
    const response = await apiClient.get(`/data-centers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDataCenters = async () => {
  try {
    const response = await apiClient.get('/settings/data-centers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserDataCenters = async (id) => {
  try {
    const response = await apiClient.get(`/data-center/user/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getTabDataCenters = async (id) => {
  try {
    const response = await apiClient.get(`/data-center/tab/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const saveDiagram = async (diagramData) => {
  try {
    const response = await apiClient.post('/diagrams', diagramData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchSvgByDataCenter = async (datacenterId) => {
  const response = await apiClient.get(`/svg-preview/${datacenterId}`);
  return response.data;
};
export const uploadSvg = async (datacenterId, svgFile) => {
  const formData = new FormData();
  formData.append('datacenter_id', datacenterId);
  formData.append('svg_file', svgFile);

  try {
    const response = await apiClient.post('/svg-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const messages = Object.values(error.response.data.errors).flat().join('\n');
      throw new Error(messages);
    }
    throw new Error('Upload failed');
  }
};

export const fetchDiagramSVG = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/diagrams/${ids}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDataCenterCount = async () => {
  const response = await apiClient.get(`/data-center/alldc`);
  return response.data;
};

// export const fetchSensorRealTimeValueByDataCenter = async (dataCenterId) => {
//   try {
//       const response = await apiClient.get(
//         `/sensor-real-time/${dataCenterId}`
//       );
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

export const fetchSensorRealTimeValueByDataCenter = async (dataCenterIds) => {
  try {
    const ids = Array.isArray(dataCenterIds) ? dataCenterIds.join(',') : dataCenterIds;
    const response = await apiClient.get(`/sensor-real-time/${ids}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching real-time sensor data:', error);
    throw error;
  }
};
