/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'crm_user_profile';

const defaultProfile = {
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

const UserProfileContext = createContext(null);

function loadProfile() {
  if (typeof window === 'undefined') return defaultProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(loadProfile);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const value = useMemo(() => ({
    profile,
    setProfile,
    updateProfile: (updates) => setProfile((prev) => ({ ...prev, ...updates })),
  }), [profile]);

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }

  return context;
}

export { defaultProfile };
