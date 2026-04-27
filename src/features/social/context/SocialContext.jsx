/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useUserProfile } from '../../settings/context/UserProfileContext';
import { fetchRolePermissions } from '../../settings/api/settingsApi';
import {
  MESSAGE_TEMPLATES_BY_MEDIUM,
} from '../data/mockData';
import {
  claimChatAssignment,
  createInitialChatStore,
  CURRENT_AGENT,
  getChatMessages,
  getChatsForSelection,
} from '../services/chatAssignmentService';

const SocialContext = createContext(undefined);
const EMPTY_SOCIAL_ACCESS = {
  canViewSocial: false,
  canHandleSocial: false,
};

function resolveSocialAccess(payload) {
  const menus = Array.isArray(payload?.menus)
    ? payload.menus
    : Array.isArray(payload?.data?.menus)
      ? payload.data.menus
      : [];

  const socialMenu = menus.find((menu) => menu?.key === 'social');
  const actions = Array.isArray(socialMenu?.permissions) ? socialMenu.permissions : [];

  const hasAction = (actionKey) => actions.some((action) => {
    const key = String(action?.key || '').trim().toLowerCase();

    return Boolean(action?.checked) && (
      key === actionKey
      || key === `social.${actionKey}`
    );
  });

  return {
    canViewSocial: hasAction('view'),
    canHandleSocial: hasAction('update'),
  };
}

export const SocialProvider = ({ children }) => {
  const { profile } = useUserProfile();
  const [activeEntity, setActiveEntity] = useState('Race Online Ltd.');
  const [activeMedium, setActiveMedium] = useState('messenger');
  const [chatStore, setChatStore] = useState(() => createInitialChatStore());
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [pendingChatId, setPendingChatId] = useState(null);
  const [isPickingChat, setIsPickingChat] = useState(false);
  const [toastState, setToastState] = useState({
    open: false,
    severity: 'success',
    message: '',
  });
  const [socialAccess, setSocialAccess] = useState(EMPTY_SOCIAL_ACCESS);
  const [isAccessLoading, setIsAccessLoading] = useState(true);

  const currentAgent = useMemo(() => ({
    id: profile?.id ? String(profile.id) : CURRENT_AGENT.id,
    name: profile?.fullName || profile?.userName || CURRENT_AGENT.name,
    role: profile?.role || '',
  }), [profile?.fullName, profile?.id, profile?.role, profile?.userName]);
  const { canViewSocial, canHandleSocial } = socialAccess;

  const contacts = useMemo(
    () => getChatsForSelection(chatStore, activeEntity, activeMedium),
    [chatStore, activeEntity, activeMedium],
  );

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) || null,
    [contacts, selectedContactId],
  );

  const messages = useMemo(
    () => (selectedContact ? getChatMessages(selectedContact.id, activeMedium, MESSAGE_TEMPLATES_BY_MEDIUM) : []),
    [selectedContact, activeMedium],
  );

  const pendingChat = useMemo(
    () => contacts.find((contact) => contact.id === pendingChatId) || null,
    [contacts, pendingChatId],
  );

  function showToast(message, severity = 'success') {
    setToastState({
      open: true,
      severity,
      message,
    });
  }

  function setSelectedContact(contact) {
    setSelectedContactId(contact?.id || null);
  }

  function requestChatSelection(contact) {
    if (!contact) return;

    if (isAccessLoading) {
      showToast('Checking social access...', 'info');
      return;
    }

    if (!canViewSocial) {
      showToast('You do not have access to this chat', 'error');
      return;
    }

    if (!canHandleSocial) {
      setSelectedContactId(contact.id);
      return;
    }

    if (contact.assignedAgentId && contact.assignedAgentId !== currentAgent.id) {
      showToast('Chat already taken', 'error');
      return;
    }

    if (contact.assignedAgentId === currentAgent.id) {
      setSelectedContactId(contact.id);
      return;
    }

    setPendingChatId(contact.id);
  }

  function closePickDialog() {
    if (isPickingChat) return;
    setPendingChatId(null);
  }

  async function confirmPickChat() {
    if (!pendingChat) return;

    setIsPickingChat(true);

    const latestChat = getChatsForSelection(chatStore, activeEntity, activeMedium)
      .find((contact) => contact.id === pendingChat.id);

    if (!latestChat) {
      showToast('Chat already taken', 'error');
      setIsPickingChat(false);
      setPendingChatId(null);
      return;
    }

    const result = await claimChatAssignment({
      chat: latestChat,
      currentAgent,
    });

    if (!result.ok) {
      showToast(result.error || 'Chat already taken', 'error');
      setIsPickingChat(false);
      setPendingChatId(null);
      return;
    }

    setChatStore((prev) => ({
      ...prev,
      [activeEntity]: {
        ...prev[activeEntity],
        [activeMedium]: prev[activeEntity][activeMedium].map((contact) => (
          contact.id === pendingChat.id ? result.contact : contact
        )),
      },
    }));

    setSelectedContactId(pendingChat.id);
    setPendingChatId(null);
    setIsPickingChat(false);
  }

  useEffect(() => {
    let active = true;

    async function loadSocialAccess() {
      if (!profile?.roleId) {
        if (active) {
          setSocialAccess(EMPTY_SOCIAL_ACCESS);
          setIsAccessLoading(false);
        }
        return;
      }

      setIsAccessLoading(true);

      try {
        const permissionPayload = await fetchRolePermissions(profile.roleId);

        if (!active) return;

        setSocialAccess(resolveSocialAccess(permissionPayload));
      } catch {
        if (!active) return;

        setSocialAccess(EMPTY_SOCIAL_ACCESS);
        showToast('Unable to load social access', 'error');
      } finally {
        if (active) {
          setIsAccessLoading(false);
        }
      }
    }

    loadSocialAccess();

    return () => {
      active = false;
    };
  }, [profile?.roleId]);

  return (
    <SocialContext.Provider value={{
      activeEntity, setActiveEntity,
      activeMedium, setActiveMedium,
      contacts,
      messages,
      currentAgent,
      viewerRole: profile?.role || '',
      canViewSocial,
      canHandleSocial,
      isAccessLoading,
      selectedContact,
      setSelectedContact,
      requestChatSelection,
      pendingChat,
      closePickDialog,
      confirmPickChat,
      isPickingChat,
    }}>
      {children}
      <Snackbar
        open={toastState.open}
        autoHideDuration={2600}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
          severity={toastState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within SocialProvider');
  return context;
};
