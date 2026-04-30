/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  MESSAGE_TEMPLATES_BY_MEDIUM,
} from '../data/mockData';
import {
  claimChatAssignment,
  createInitialChatStore,
  CURRENT_AGENT,
  getChatMessages,
  getChatsForSelection,
  releaseChatAssignment,
} from '../services/chatAssignmentService';

const SocialContext = createContext(undefined);
const buildSelectionKey = (entity, medium) => `${entity}::${medium}`;

export const SocialProvider = ({ children }) => {
  const [activeEntity, setActiveEntity] = useState('Race Online Ltd.');
  const [activeMedium, setActiveMedium] = useState('messenger');
  const [chatStore, setChatStore] = useState(() => createInitialChatStore());
  const [selectedContactIds, setSelectedContactIds] = useState({});
  const [pendingChatId, setPendingChatId] = useState(null);
  const [isPickingChat, setIsPickingChat] = useState(false);
  const [toastState, setToastState] = useState({
    open: false,
    severity: 'success',
    message: '',
  });
  const activeSelectionKey = buildSelectionKey(activeEntity, activeMedium);
  const selectedContactId = selectedContactIds[activeSelectionKey] || null;

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
    setSelectedContactIds((prev) => ({
      ...prev,
      [activeSelectionKey]: contact?.id || null,
    }));
  }

  function requestChatSelection(contact) {
    if (!contact) return;

    if (contact.assignedAgentId && contact.assignedAgentId !== CURRENT_AGENT.id) {
      showToast('Chat already taken', 'error');
      return;
    }

    if (contact.assignedAgentId === CURRENT_AGENT.id) {
      setSelectedContactIds((prev) => ({
        ...prev,
        [activeSelectionKey]: contact.id,
      }));
      return;
    }

    setPendingChatId(contact.id);
  }

  function closePickDialog() {
    if (isPickingChat) return;
    setPendingChatId(null);
  }

  function closeActiveChat() {
    if (!selectedContact) return;

    const releasedContact = releaseChatAssignment({ chat: selectedContact });

    setChatStore((prev) => ({
      ...prev,
      [activeEntity]: {
        ...prev[activeEntity],
        [activeMedium]: prev[activeEntity][activeMedium].map((contact) => (
          contact.id === selectedContact.id ? releasedContact : contact
        )),
      },
    }));

    setSelectedContactIds((prev) => ({
      ...prev,
      [activeSelectionKey]: null,
    }));
    showToast('Chat released.');
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
      currentAgent: CURRENT_AGENT,
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

    setSelectedContactIds((prev) => ({
      ...prev,
      [activeSelectionKey]: pendingChat.id,
    }));
    setPendingChatId(null);
    setIsPickingChat(false);
  }

  return (
    <SocialContext.Provider value={{
      activeEntity, setActiveEntity,
      activeMedium, setActiveMedium,
      contacts,
      messages,
      currentAgent: CURRENT_AGENT,
      showToast,
      selectedContact,
      setSelectedContact,
      requestChatSelection,
      closeActiveChat,
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
