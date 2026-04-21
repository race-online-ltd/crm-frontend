import api from '@/api/config/axiosInstance';

export async function fetchBusinessEntities() {
  const response = await api.get('/system/business-entities');
  return response.data?.data ?? [];
}

export async function createBusinessEntity(payload) {
  const response = await api.post('/system/business-entities', payload);
  return response.data?.data;
}

export async function updateBusinessEntity(id, payload) {
  const response = await api.put(`/system/business-entities/${id}`, payload);
  return response.data?.data;
}

export async function deleteBusinessEntity(id) {
  const response = await api.delete(`/system/business-entities/${id}`);
  return response.data?.message;
}

export async function fetchRoles() {
  const response = await api.get('/system/roles');
  return response.data?.data ?? [];
}

export async function createRole(payload) {
  const response = await api.post('/system/roles', payload);
  return response.data?.data;
}

export async function fetchRolePermissions(roleId) {
  const response = await api.get(`/system/roles/${roleId}/permissions`);
  return response.data?.data ?? response.data ?? { groups: [], standalone: [] };
}

export async function updateRolePermissions(roleId, payload) {
  const response = await api.put(`/system/roles/${roleId}/permissions`, payload);
  return response.data?.data ?? response.data;
}

export async function fetchSystemUsers() {
  const response = await api.get('/system/users');
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function fetchSystemUsersPaginated(params = {}) {
  const response = await api.get('/system/users', { params });
  return {
    data: response.data?.data ?? [],
    meta: response.data?.meta ?? null,
  };
}

export async function createSystemUser(payload) {
  const response = await api.post('/system/users', payload);
  return response.data?.data;
}

export async function updateSystemUser(id, payload) {
  const response = await api.put(`/system/users/${id}`, payload);
  return response.data?.data;
}

export async function fetchTeams() {
  const response = await api.get('/system/teams');
  return response.data?.data ?? [];
}

export async function createTeam(payload) {
  const response = await api.post('/system/teams', payload);
  return response.data?.data;
}

export async function updateTeam(id, payload) {
  const response = await api.put(`/system/teams/${id}`, payload);
  return response.data?.data;
}

export async function deleteTeam(id) {
  const response = await api.delete(`/system/teams/${id}`);
  return response.data?.message;
}

export async function fetchGroups() {
  const response = await api.get('/system/groups');
  return response.data?.data ?? [];
}

export async function createGroup(payload) {
  const response = await api.post('/system/groups', payload);
  return response.data?.data;
}

export async function updateGroup(id, payload) {
  const response = await api.put(`/system/groups/${id}`, payload);
  return response.data?.data;
}

export async function deleteGroup(id) {
  const response = await api.delete(`/system/groups/${id}`);
  return response.data?.message;
}

export async function updateRolePermissionsPost(roleId, payload) {
  const response = await api.post(`/system/roles/${roleId}/update-permissions`, payload);
  return response.data?.data ?? response.data;
}

export async function fetchBackofficeOptions() {
  const response = await api.get('/system/backoffice/options');
  return response.data?.data ?? {
    business_entities: [],
    system_users: [],
  };
}

export async function fetchBackoffices() {
  const response = await api.get('/system/backoffice');
  return response.data?.data ?? [];
}

export async function createBackoffice(payload) {
  const response = await api.post('/system/backoffice', payload);
  return response.data?.data;
}

export async function updateBackoffice(id, payload) {
  const response = await api.put(`/system/backoffice/${id}`, payload);
  return response.data?.data;
}

export async function deleteBackoffice(id) {
  const response = await api.delete(`/system/backoffice/${id}`);
  return response.data?.message;
}

export async function fetchKamMappingOptions() {
  const response = await api.get('/system/kam-mappings/options');
  return response.data?.data ?? {
    system_users: [],
    business_entities: [],
  };
}

export async function fetchProductsByBusinessEntity(businessEntityId) {
  const response = await api.get(`/system/business-entities/${businessEntityId}/products`);
  return response.data?.data ?? [];
}

export async function fetchKamProductMapping(params) {
  const response = await api.get('/system/kam-mappings', { params });
  return response.data?.data ?? {
    user_id: null,
    business_entity_id: null,
    product_ids: [],
    products: [],
  };
}

export async function saveKamProductMapping(payload) {
  const response = await api.post('/system/kam-mappings', payload);
  return response.data?.data;
}


// cloumn mapping
export async function fetchColumnMappings() {
  const response = await api.get('/entity-column-mappings/');
  return response.data?.data ?? response.data ?? [];
}




export async function storeColumnMapping(payload) {
  const response = await api.post('/entity-column-mappings/', payload);
  return response.data?.data ?? response.data ?? [];
}


export async function fetchPageNavigationItems() {
  const response = await api.get('/entity-column-mappings/get-navigation-items');
  return response.data?.data ?? response.data ?? [];
}



// export async function fetchEntityWiseTableColumn() {
//   const response = await api.get('/entity-column-mappings/table-column-mappings');
//   return response.data?.data ?? response.data ?? [];
// }


export async function fetchEntityWiseTableColumn({ page_id, table_id }) {
  const response = await api.get('/entity-column-mappings/table-column-mappings', {
    params: {
      page_id,
      table_id,
    },
  });
  return response.data?.data ?? response.data ?? [];
}


export async function fetchTableItems() {
  const response = await api.get('/entity-column-mappings/get-table-items');
  return response.data?.data ?? response.data ?? [];
}



export async function fetchColumnItems() {
  const response = await api.get('/entity-column-mappings/get-column-items');
  return response.data?.data ?? response.data ?? [];
}



// api for user wise view permissuions in page navigation

export async function fetchPageNames() {
  const response = await api.get('/navigation-items/active');
  return response.data?.data ?? response.data ?? [];
}


export async function fetchPageFeatures(navigationId) {
  const response = await api.get(`/navigation-features/${navigationId}`);
  return response.data?.data ?? response.data ?? [];
}



export async function storeUserViewPermissions(payload) {
  const response = await api.post('/user-view-permissions/', payload);
  return response.data?.data ?? response.data ?? [];
}


export async function getUserViewPermissions(role_id, navigation_id) {
  const response = await api.get('/user-view-permissions', {
    params: { role_id, navigation_id }
  });

  return response.data?.data ?? response.data ?? [];
}



export async function updateUserViewPermissions(payload) {
  const response = await api.put('/user-view-permissions', payload);
  return response.data?.data ?? response.data ?? [];
}



export async function storeFeatureActionPermissions(payload) {
  const response = await api.post('/feature-action-permissions/', payload);
  return response.data?.data ?? response.data ?? [];
}



export async function showFeatureActionPermissions(user_view_id) {
  const response = await api.get(
    `/feature-action-permissions/${user_view_id}`
  );

  return response.data?.data ?? response.data ?? [];
}



export async function updateFeatureActionPermissions(user_view_id, payload) {
  const response = await api.put(
    `/feature-action-permissions/${user_view_id}`,
    payload
  );

  return response.data?.data ?? response.data ?? [];
}






export async function fetchColumnMappingsFiltered(filters = {}) {
  try {
    const response = await api.get('/entity-column-mappings', { params: filters });
    return response.data?.data ?? [];
  } catch (error) {
    console.error('Error fetching filtered column mappings:', error);
    return [];
  }
}
 
// /**
//  * Store a single column mapping
//  * @param {Object} payload - { entity_id, page_id, table_id, column_id }
//  */
// export async function storeColumnMapping(payload) {
//   try {
//     const response = await api.post('/entity-column-mappings', payload);
//     return response.data?.data ?? response.data ?? [];
//   } catch (error) {
//     console.error('Error storing column mapping:', error);
//     throw error;
//   }
// }
 
// /**
//  * Delete column mappings by criteria
//  * @param {Object} criteria - { entity_id, page_id, table_id }
//  */
export async function deleteColumnMappingsByCriteria(criteria) {
  try {
    const response = await api.delete('/entity-column-mappings/delete-by-criteria', {
      params: criteria
    });
    return response.data ?? [];
  } catch (error) {
    console.error('Error deleting column mappings by criteria:', error);
    throw error;
  }
}



export async function updateColumnMapping(payload) {
  const response = await api.put('/entity-column-mappings', payload);
  return response.data;
}



// export async function updateColumnMapping(id, mappingData) {
//   const response = await api.put(
//     `/entity-column-mappings/${id}`,
//     {
//       entity_id: mappingData.entity_id,
//       page_id: mappingData.page_id,
//       table_id: mappingData.table_id,
//       column_id: mappingData.column_id,
//     }
//   );
 
//   return response.data;
// }