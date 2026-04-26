import { apiClient } from "./api-config/config";

export const getUsers = async () => {
  try {
    const response = await apiClient.get("/auth/user");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Authenticate user
// export const authenticateUser = async (data) => {
//   try {
//     const response = await apiClient.post("/auth/login",data)
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const authenticateUser = async (data) => {
  try {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    return response;
  } catch (error) {
    throw error;
  }
};


// New function for user-permissions
export const getUserPermissions = async () => {
  try {
    const response = await apiClient.get("/user-permissions");
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // ❗ silent fail (important)
      return { permissions: [] };
    }
    throw error;
  }
};


// Fetch role edit data (name, all permissions, and assigned ones)
export const getRoleEditData = async (roleId) => {
  try {
    const response = await apiClient.get(`/roles/${roleId}/edit-data`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update role with new name and permission IDs
export const updateRole = async (roleId, data) => {
  try {
    const response = await apiClient.put(`/roles/${roleId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Register user
export const registerUser = async (data) => {
  try {
    const response = await apiClient.post("/user/userregister", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const fetchUsers = async () => {
  try {
    const response = await apiClient.get("/user/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUser = async (id) => {
  try {
    const response = await apiClient.get(`/user/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient.put(`/user/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`/user/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
