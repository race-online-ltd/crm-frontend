// import SearchIcon from '@mui/icons-material/Search';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import IconButton from '@mui/material/IconButton';

// const WhatsAppChatList = ({ contacts, selectedContact, onSelectContact }) => {
//   return (
//     <div className="whatsapp-list">
//       <div className="whatsapp-list__header">
//         <h2 className="whatsapp-list__title">WhatsApp</h2>
//         <IconButton size="small" sx={{ color: '#fff' }}>
//           <MoreVertIcon fontSize="small" />
//         </IconButton>
//       </div>

//       <div className="whatsapp-list__search">
//         <div className="whatsapp-list__search-wrapper">
//           <SearchIcon className="whatsapp-list__search-icon" sx={{ fontSize: 18 }} />
//           <input
//             type="text"
//             placeholder="Search or start new chat"
//             className="whatsapp-list__search-input"
//           />
//         </div>
//       </div>

//       <div className="whatsapp-list__contacts">
//         {contacts.map((contact) => (
//           <button
//             key={contact.id}
//             onClick={() => onSelectContact(contact)}
//             className={`whatsapp-list__item ${selectedContact?.id === contact.id ? 'whatsapp-list__item--active' : ''}`}
//           >
//             <div className="whatsapp-list__avatar">
//               {contact.name.charAt(0)}
//             </div>
//             <div className="whatsapp-list__info">
//               <div className="whatsapp-list__name-row">
//                 <span className="whatsapp-list__name">{contact.name}</span>
//                 <span className={`whatsapp-list__time ${contact.unreadCount > 0 ? 'whatsapp-list__time--unread' : 'whatsapp-list__time--read'}`}>
//                   {contact.lastMessageTime}
//                 </span>
//               </div>
//               <div className="whatsapp-list__preview-row">
//                 <p className="whatsapp-list__preview">{contact.lastMessage}</p>
//                 {contact.unreadCount > 0 && (
//                   <div className="whatsapp-list__unread-badge">{contact.unreadCount}</div>
//                 )}
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default WhatsAppChatList;


import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import ChatConversionTooltip from '../ChatConversionTooltip';
import { CHAT_FILTERS, getFilteredContacts } from '../chatListUtils';

const WhatsAppChatList = ({ contacts, selectedContact, currentAgentId, onSelectContact }) => {
  const [filter, setFilter] = useState(CHAT_FILTERS.UNREAD);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedContact?.queueStatus === 'active') {
      setFilter(CHAT_FILTERS.ACTIVE);
    }
  }, [selectedContact]);

  const filtered = getFilteredContacts({
    contacts,
    filter,
    searchQuery,
    currentAgentId,
  });

  return (
    <div className="whatsapp-list">
      <div className="whatsapp-list__header">
        <h2 className="whatsapp-list__title">WhatsApp</h2>
        <IconButton size="small" sx={{ color: '#fff' }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </div>

      <div className="whatsapp-list__search">
        <div className="whatsapp-list__search-wrapper">
          <SearchIcon className="whatsapp-list__search-icon" sx={{ fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="whatsapp-list__search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="whatsapp-list__filters">
        <Chip
          label="Pending"
          size="small"
          variant={filter === CHAT_FILTERS.UNREAD ? 'filled' : 'outlined'}
          onClick={() => setFilter(CHAT_FILTERS.UNREAD)}
          sx={{ borderColor: '#25D366', color: filter === CHAT_FILTERS.UNREAD ? '#fff' : '#25D366',
                bgcolor: filter === CHAT_FILTERS.UNREAD ? '#25D366' : 'transparent', fontSize: 11 }}
        />
        <Chip
          label="Activated"
          size="small"
          variant={filter === CHAT_FILTERS.ACTIVE ? 'filled' : 'outlined'}
          onClick={() => setFilter(CHAT_FILTERS.ACTIVE)}
          sx={{ borderColor: '#25D366', color: filter === CHAT_FILTERS.ACTIVE ? '#fff' : '#25D366',
                bgcolor: filter === CHAT_FILTERS.ACTIVE ? '#25D366' : 'transparent', fontSize: 11 }}
        />
      </div>

      <div className="whatsapp-list__contacts">
        {filtered.map((contact) => {
          const isAssignedToOtherAgent = Boolean(contact.assignedAgentId && contact.assignedAgentId !== currentAgentId);

          return (
          <ChatConversionTooltip key={contact.id} contact={contact}>
            <button
              onClick={() => !isAssignedToOtherAgent && onSelectContact(contact)}
              disabled={isAssignedToOtherAgent}
              className={`whatsapp-list__item ${
                selectedContact?.id === contact.id ? 'whatsapp-list__item--active' : ''
              } ${isAssignedToOtherAgent ? 'whatsapp-list__item--disabled' : ''}`}
            >
              <div className="whatsapp-list__avatar">
                {contact.name.charAt(0)}
              </div>
              <div className="whatsapp-list__info">
                <div className="whatsapp-list__name-row">
                  <span className="whatsapp-list__name">{contact.name}</span>
                  <span className={`whatsapp-list__time ${
                    contact.unreadCount > 0
                      ? 'whatsapp-list__time--unread'
                      : 'whatsapp-list__time--read'
                  }`}>
                    {contact.lastMessageTime}
                  </span>
                </div>
                <div className="whatsapp-list__preview-row">
                  <div className="whatsapp-list__preview-wrap">
                    <p className="whatsapp-list__preview">{contact.lastMessage}</p>
                    {contact.assignedAgentId && (
                      <p className="social-chat-assignee social-chat-assignee--dark">
                        Assigned to {contact.assignedAgentName || contact.assignedAgentId}
                      </p>
                    )}
                  </div>
                  {contact.unreadCount > 0 && (
                    <div className="whatsapp-list__unread-badge">{contact.unreadCount}</div>
                  )}
                </div>
              </div>
            </button>
          </ChatConversionTooltip>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsAppChatList;
