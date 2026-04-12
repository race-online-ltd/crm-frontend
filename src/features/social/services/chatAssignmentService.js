import { CONTACT_TEMPLATES_BY_MEDIUM, entities } from '../data/mockData';

export const CURRENT_AGENT = {
  id: 'agent_1',
  name: 'Agent 1',
};

export const CHAT_PICK_DELAY_MS = 900;

function cloneContact(contact) {
  return {
    ...contact,
  };
}

export function createInitialChatStore() {
  return entities.reduce((entityAcc, entity) => {
    entityAcc[entity] = Object.entries(CONTACT_TEMPLATES_BY_MEDIUM).reduce((mediumAcc, [medium, contacts]) => {
      mediumAcc[medium] = contacts.map(cloneContact);
      return mediumAcc;
    }, {});
    return entityAcc;
  }, {});
}

export function getChatsForSelection(chatStore, entity, medium) {
  return chatStore?.[entity]?.[medium] || [];
}

export function getChatMessages(contactId, medium, messageTemplatesByMedium) {
  const messages = messageTemplatesByMedium[medium] || [];
  return messages.map((message) => ({
    ...message,
    contactId,
  }));
}

export async function claimChatAssignment({ chat, currentAgent }) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, CHAT_PICK_DELAY_MS);
  });

  if (chat.assignedAgentId && chat.assignedAgentId !== currentAgent.id) {
    return {
      ok: false,
      error: 'Chat already taken',
    };
  }

  if (chat.assignedAgentId === currentAgent.id) {
    return {
      ok: true,
      contact: chat,
    };
  }

  return {
    ok: true,
    contact: {
      ...chat,
      queueStatus: 'active',
      assignedAgentId: currentAgent.id,
      assignedAgentName: currentAgent.name,
      unreadCount: 0,
    },
  };
}
