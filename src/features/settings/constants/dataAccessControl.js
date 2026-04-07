export const BUSINESS_ENTITIES = [
  'Earth Telecommunication',
  'Race Online Ltd.',
  'Orbit Internet',
  'Dhaka COLO',
  'Creative Bangladesh',
  'Ocloud',
];

export const ROLE_OPTIONS = [
  { id: 'admin', label: 'Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'executive', label: 'Executive' },
  { id: 'viewer', label: 'Viewer' },
];

export const FEATURE_OPTIONS = [
  { id: 'invoice', label: 'Invoice' },
  { id: 'collections', label: 'Collections' },
  { id: 'customer', label: 'Customer' },
  { id: 'reports', label: 'Reports' },
];

function makePermissions(overrides = {}) {
  return BUSINESS_ENTITIES.reduce((acc, entityName) => {
    acc[entityName] = overrides[entityName] || { read: false, write: false };
    return acc;
  }, {});
}

export const MOCK_ACCESS_CONTROL = {
  admin: {
    invoice: {
      roleId: 'admin',
      featureKey: 'invoice',
      fields: [
        {
          fieldName: 'Total Invoice',
          permissions: makePermissions({
            'Earth Telecommunication': { read: true, write: true },
            'Race Online Ltd.': { read: true, write: true },
            'Orbit Internet': { read: true, write: true },
            'Dhaka COLO': { read: true, write: true },
            'Creative Bangladesh': { read: true, write: true },
            Ocloud: { read: true, write: true },
          }),
        },
      ],
    },
    collections: {
      roleId: 'admin',
      featureKey: 'collections',
      fields: [
        {
          fieldName: 'Total Invoice',
          permissions: makePermissions({
            'Earth Telecommunication': { read: true, write: true },
            'Race Online Ltd.': { read: true, write: true },
            'Orbit Internet': { read: true, write: false },
            'Dhaka COLO': { read: true, write: false },
          }),
        },
      ],
    },
  },
  manager: {
    invoice: {
      roleId: 'manager',
      featureKey: 'invoice',
      fields: [
        {
          fieldName: 'Total Invoice',
          permissions: makePermissions({
            'Earth Telecommunication': { read: true, write: false },
            'Race Online Ltd.': { read: true, write: true },
            'Orbit Internet': { read: true, write: false },
            'Dhaka COLO': { read: false, write: false },
            'Creative Bangladesh': { read: true, write: false },
            Ocloud: { read: false, write: false },
          }),
        },
      ],
    },
  },
};

export function buildDefaultAccessControl(roleId, featureKey) {
  return {
    roleId,
    featureKey,
    fields: [
      {
        fieldName: 'Total Invoice',
        permissions: makePermissions(),
      },
    ],
  };
}

export function getMockAccessControl(roleId, featureKey) {
  return MOCK_ACCESS_CONTROL[roleId]?.[featureKey] || buildDefaultAccessControl(roleId, featureKey);
}

export function permissionLabel(permission = { read: false, write: false }) {
  if (permission.read && permission.write) return 'Read, Write';
  if (permission.write) return 'Write';
  if (permission.read) return 'Read';
  return '';
}
