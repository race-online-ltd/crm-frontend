const STORAGE_KEY = 'crm_user_profile';

export const defaultProfile = {
  fullName: 'John Doe',
  userName: 'johndoe',
  email: 'john@gmail.com',
  mobile: '+880 1711-223344',
  phone: '+880 1234-567890',
  role: 'System Admin',
  department: 'Operations',
  employeeId: 'EMP-001',
  joinDate: 'Jan 12, 2025',
  status: 'Active',
  avatar: '',
  gender: 'Male',
  dateOfBirth: 'Jan 12, 1994',
  nationality: 'Bangladeshi',
  maritalStatus: 'Married',
  presentAddress: 'Gulshan, Dhaka',
  permanentAddress: 'Comilla',
  bloodGroup: 'O+',
  education: [
    {
      degree: 'MBA in Marketing',
      institution: 'University of Dhaka',
      duration: '2018 - 2020',
    },
    {
      degree: 'BBA in Management',
      institution: 'National University',
      duration: '2013 - 2017',
    },
  ],
  accountInfo: {
    bankName: 'BRAC Bank PLC',
    accountNumber: '0123-4567-8901',
    taxId: 'TIN-123456',
    insuranceId: 'INS-998877',
  },
};

export function loadUserProfile() {
  if (typeof window === 'undefined') {
    return defaultProfile;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultProfile;
    }

    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveUserProfile(profile) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function changeUserPassword(values) {
  return Promise.resolve({
    success: true,
    values,
  });
}
