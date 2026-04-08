export const CRITERIA_OPTIONS = [
  { id: 'business_entity', label: 'Business Entity' },
  { id: 'field_level', label: 'Field Level Control' },
];

export const BUSINESS_ENTITIES = [
  { id: 'earth_telecommunication', label: 'Earth Telecommunication' },
  { id: 'race_online', label: 'Race Online Ltd.' },
  { id: 'orbit_internet', label: 'Orbit Internet' },
  { id: 'dhaka_colo', label: 'Dhaka COLO' },
  { id: 'creative_bangladesh', label: 'Creative Bangladesh' },
  { id: 'ocloud', label: 'Ocloud' },
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

export const FEATURE_FIELD_OPTIONS = {
  invoice: [
    'Invoice Number',
    'Invoice Date',
    'Customer Name',
    'Billing Address',
    'Invoice Amount',
    'Tax Amount',
    'Discount',
    'Due Date',
    'Payment Status',
  ],
  collections: [
    'Collection Date',
    'Invoice Reference',
    'Collected Amount',
    'Outstanding Amount',
    'Collector Name',
    'Collection Method',
    'Collection Status',
  ],
  customer: [
    'Customer Name',
    'Customer ID',
    'Email Address',
    'Phone Number',
    'Billing Address',
    'Service Plan',
    'Account Status',
  ],
  reports: [
    'Report Name',
    'Generated Date',
    'Business Entity',
    'Revenue Summary',
    'Expense Summary',
    'Collection Summary',
    'Prepared By',
  ],
};

function buildEntityReadPermissions(overrides = {}) {
  return BUSINESS_ENTITIES.reduce((acc, entity) => {
    acc[entity.label] = { read: Boolean(overrides[entity.label]?.read) };
    return acc;
  }, {});
}

function buildFieldLevelPermissions(overrides = {}) {
  return {
    read: Boolean(overrides.read),
    write: Boolean(overrides.write),
    modify: Boolean(overrides.modify),
  };
}

function buildBusinessEntityRows(featureKey, overrides = {}) {
  return (FEATURE_FIELD_OPTIONS[featureKey] || []).map((fieldName) => ({
    fieldName,
    permissions: buildEntityReadPermissions(overrides[fieldName]),
  }));
}

function buildFieldLevelRows(featureKey, overrides = {}) {
  return (FEATURE_FIELD_OPTIONS[featureKey] || []).map((fieldName) => ({
    fieldName,
    permissions: buildFieldLevelPermissions(overrides[fieldName]),
  }));
}

export const MOCK_BUSINESS_ENTITY_ACCESS_CONTROL = {
  admin: {
    invoice: buildBusinessEntityRows('invoice', {
      'Invoice Number': {
        'Earth Telecommunication': { read: true },
        'Race Online Ltd.': { read: true },
        'Orbit Internet': { read: true },
        'Dhaka COLO': { read: true },
        'Creative Bangladesh': { read: true },
        Ocloud: { read: true },
      },
      'Invoice Amount': {
        'Earth Telecommunication': { read: true },
        'Race Online Ltd.': { read: true },
        'Orbit Internet': { read: true },
      },
      'Discount': {
        'Race Online Ltd.': { read: true },
        'Orbit Internet': { read: true },
      },
    }),
  },
  manager: {
    invoice: buildBusinessEntityRows('invoice', {
      'Invoice Number': {
        'Earth Telecommunication': { read: true },
        'Race Online Ltd.': { read: true },
        'Orbit Internet': { read: true },
      },
      'Invoice Amount': {
        'Race Online Ltd.': { read: true },
        'Creative Bangladesh': { read: true },
      },
      'Payment Status': {
        'Race Online Ltd.': { read: true },
        'Orbit Internet': { read: true },
      },
    }),
    reports: buildBusinessEntityRows('reports', {
      'Revenue Summary': {
        'Race Online Ltd.': { read: true },
        'Orbit Internet': { read: true },
      },
    }),
  },
};

export const MOCK_FIELD_LEVEL_ACCESS_CONTROL = {
  admin: {
    invoice: buildFieldLevelRows('invoice', {
      'Invoice Number': { read: true, write: true, modify: true },
      'Invoice Date': { read: true, write: true, modify: true },
      'Customer Name': { read: true, write: true, modify: true },
      'Invoice Amount': { read: true, write: true, modify: true },
      'Discount': { read: true, write: true, modify: true },
      'Payment Status': { read: true, write: true, modify: true },
    }),
  },
  manager: {
    invoice: buildFieldLevelRows('invoice', {
      'Invoice Number': { read: true, write: false, modify: false },
      'Invoice Date': { read: true, write: false, modify: false },
      'Customer Name': { read: true, write: false, modify: false },
      'Invoice Amount': { read: true, write: false, modify: false },
      'Payment Status': { read: true, write: true, modify: true },
    }),
    reports: buildFieldLevelRows('reports', {
      'Report Name': { read: true, write: false, modify: false },
      'Generated Date': { read: true, write: false, modify: false },
      'Revenue Summary': { read: true, write: false, modify: false },
    }),
  },
};

export function buildDefaultBusinessEntityAccessControl(roleId, featureKey) {
  return {
    roleId,
    featureKey,
    fields: buildBusinessEntityRows(featureKey),
  };
}

export function getMockBusinessEntityAccessControl(roleId, featureKey) {
  const existing = MOCK_BUSINESS_ENTITY_ACCESS_CONTROL[roleId]?.[featureKey];

  if (existing) {
    return {
      roleId,
      featureKey,
      fields: existing.map((field) => ({
        ...field,
        permissions: { ...field.permissions },
      })),
    };
  }

  return buildDefaultBusinessEntityAccessControl(roleId, featureKey);
}

export function buildDefaultFieldLevelAccessControl(roleId, featureKey) {
  return {
    roleId,
    featureKey,
    fields: buildFieldLevelRows(featureKey),
  };
}

export function getMockFieldLevelAccessControl(roleId, featureKey) {
  const existing = MOCK_FIELD_LEVEL_ACCESS_CONTROL[roleId]?.[featureKey];

  if (existing) {
    return {
      roleId,
      featureKey,
      fields: existing.map((field) => ({
        ...field,
        permissions: { ...field.permissions },
      })),
    };
  }

  return buildDefaultFieldLevelAccessControl(roleId, featureKey);
}

export function permissionLabel(permission = { read: false }) {
  if (permission.read) return 'Read';
  return '';
}
