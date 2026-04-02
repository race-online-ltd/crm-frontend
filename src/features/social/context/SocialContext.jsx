import { createContext, useContext, useState } from 'react';

const SocialContext = createContext(undefined);

export const SocialProvider = ({ children }) => {
  const [activeEntity, setActiveEntity] = useState('Race Online Ltd.');
  const [activeMedium, setActiveMedium] = useState('messenger');
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <SocialContext.Provider value={{
      activeEntity, setActiveEntity,
      activeMedium, setActiveMedium,
      selectedContact, setSelectedContact,
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within SocialProvider');
  return context;
};
