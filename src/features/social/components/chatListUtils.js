export const CHAT_FILTERS = {
  UNREAD: 'UNREAD',
  ACTIVE: 'ACTIVE',
};

export function getFilteredContacts({
  contacts,
  filter,
  searchQuery,
  currentAgentId,
}) {
  const query = searchQuery.trim().toLowerCase();

  const filteredContacts = contacts
    .filter((contact) => {
      if (filter === CHAT_FILTERS.UNREAD) return contact.queueStatus === 'unread';
      return contact.queueStatus === 'active';
    })
    .filter((contact) => {
      if (!query) return true;
      return `${contact.name} ${contact.lastMessage}`.toLowerCase().includes(query);
    });

  if (filter !== CHAT_FILTERS.ACTIVE) {
    return filteredContacts;
  }

  return filteredContacts
    .map((contact, index) => ({ contact, index }))
    .sort((left, right) => {
      const leftOwnChat = left.contact.assignedAgentId === currentAgentId ? 0 : 1;
      const rightOwnChat = right.contact.assignedAgentId === currentAgentId ? 0 : 1;

      if (leftOwnChat !== rightOwnChat) {
        return leftOwnChat - rightOwnChat;
      }

      return left.index - right.index;
    })
    .map(({ contact }) => contact);
}
