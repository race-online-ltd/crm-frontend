const BUSINESS_ENTITY_CONNECTION_OPTIONS = [
  { id: 'race_online', label: 'Race Online Ltd.' },
  { id: 'earth_telecom', label: 'Earth Telecom' },
  { id: 'dhaka_colo', label: 'Dhaka COLO' },
  { id: 'orbit_internet', label: 'Orbit Internet' },
];

const EXTERNAL_USERS_BY_ENTITY = {
  race_online: [
    { id: 'race_usr_1', label: 'Race User - Ahmed Khan' },
    { id: 'race_usr_2', label: 'Race User - Nabila Sultana' },
  ],
  earth_telecom: [
    { id: 'earth_usr_1', label: 'Earth User - Farhan Ali' },
    { id: 'earth_usr_2', label: 'Earth User - Tanjim Noor' },
  ],
  dhaka_colo: [
    { id: 'colo_usr_1', label: 'Dhaka COLO User - Imran Hossain' },
  ],
  orbit_internet: [
    { id: 'orbit_usr_1', label: 'Orbit User - Sadia Karim' },
  ],
};

export async function fetchBusinessEntitiesForAccountConnection() {
  // Backend-ready placeholder:
  // return api.get('/system-account-connections/business-entities');
  return BUSINESS_ENTITY_CONNECTION_OPTIONS;
}

export async function fetchExternalUsersForBusinessEntity(businessEntityId) {
  // Backend-ready placeholder:
  // return api.get(`/system-account-connections/business-entities/${businessEntityId}/users`);
  return EXTERNAL_USERS_BY_ENTITY[businessEntityId] || [];
}

export async function saveSystemAccountConnections(payload) {
  // Backend-ready placeholder:
  // return api.post('/system-account-connections', payload);
  console.log('Connect system accounts payload:', payload);
  return { success: true };
}
