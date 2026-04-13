const FALLBACK_KAM_OPTIONS = [
  { id: 'kam_1', label: 'KAM - Arif Rahman', role: 'KAM', userName: 'arif.rahman' },
  { id: 'kam_2', label: 'KAM - Sadia Noor', role: 'KAM', userName: 'sadia.noor' },
  { id: 'kam_3', label: 'KAM - Shahid Hasan', role: 'KAM', userName: 'shahid.hasan' },
  { id: 'kam_4', label: 'KAM - Tania Akter', role: 'KAM', userName: 'tania.akter' },
];

function normalizeRole(role = '') {
  return String(role).trim().toLowerCase();
}

function normalizeId(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getProfileIdentity(profile = {}) {
  const role = profile.role || '';
  const fullName = profile.fullName || 'Current User';
  const userName = profile.userName || normalizeId(fullName) || 'current_user';

  return {
    id: profile.id || profile.userId || userName,
    fullName,
    userName,
    role,
  };
}

export function isSupervisorRole(role = '') {
  return normalizeRole(role).includes('supervisor');
}

export function isKamRole(role = '') {
  const normalized = normalizeRole(role);
  return normalized === 'kam' || normalized.includes(' key account manager');
}

export function getAssignableKamOptions() {
  return FALLBACK_KAM_OPTIONS;
}

export function buildTaskAssignment({ profile, selectedKamId = '' }) {
  const currentUser = getProfileIdentity(profile);
  const selectedKam = getAssignableKamOptions().find((option) => option.id === selectedKamId) || null;

  if (!selectedKam) {
    return {
      assignedToUserId: currentUser.id,
      assignedToUserName: currentUser.fullName,
      assignedToUserRole: currentUser.role,
      assignedToKamId: null,
      assignedToKamName: null,
      assignmentMode: 'self',
      createdByUserId: currentUser.id,
      createdByUserName: currentUser.fullName,
      createdByUserRole: currentUser.role,
    };
  }

  return {
    assignedToUserId: selectedKam.id,
    assignedToUserName: selectedKam.label,
    assignedToUserRole: selectedKam.role,
    assignedToKamId: selectedKam.id,
    assignedToKamName: selectedKam.label,
    assignmentMode: 'delegated',
    createdByUserId: currentUser.id,
    createdByUserName: currentUser.fullName,
    createdByUserRole: currentUser.role,
  };
}

export function canAccessTask(task = {}, profile = {}) {
  const currentUser = getProfileIdentity(profile);
  const currentRole = profile.role || '';
  const assignedToUserId = task.assignedToUserId || task.assignedToKamId || null;
  const createdByUserId = task.createdByUserId || null;

  if (!assignedToUserId && !createdByUserId) {
    return true;
  }

  if (currentUser.id === assignedToUserId || currentUser.id === createdByUserId) {
    return true;
  }

  if (isSupervisorRole(currentRole) && createdByUserId === currentUser.id) {
    return true;
  }

  return false;
}
