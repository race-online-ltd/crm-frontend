// import SearchIcon from '@mui/icons-material/Search';
// import Badge from '@mui/material/Badge';

// const MessengerChatList = ({ contacts, selectedContact, onSelectContact }) => {
//   return (
//     <div className="messenger-list">
//       <div className="messenger-list__header">
//         <h2 className="messenger-list__title">Chats</h2>
//         <div className="messenger-list__search">
//           <SearchIcon className="messenger-list__search-icon" sx={{ fontSize: 18 }} />
//           <input
//             type="text"
//             placeholder="Search Messenger"
//             className="messenger-list__search-input"
//           />
//         </div>
//       </div>

//       <div className="messenger-list__contacts">
//         {contacts.map((contact) => (
//           <button
//             key={contact.id}
//             onClick={() => onSelectContact(contact)}
//             className={`messenger-list__item ${selectedContact?.id === contact.id ? 'messenger-list__item--active' : ''}`}
//           >
//             <div className="messenger-list__avatar">
//               <div className="messenger-list__avatar-circle">
//                 {contact.name.charAt(0)}
//               </div>
//               {contact.online && <div className="messenger-list__online-dot" />}
//             </div>

//             <div className="messenger-list__info">
//               <div className="messenger-list__name-row">
//                 <span className={`messenger-list__name ${contact.unreadCount > 0 ? 'messenger-list__name--unread' : ''}`}>
//                   {contact.name}
//                 </span>
//                 <span className="messenger-list__time">{contact.lastMessageTime}</span>
//               </div>
//               <p className={`messenger-list__preview ${contact.unreadCount > 0 ? 'messenger-list__preview--unread' : ''}`}>
//                 {contact.lastMessage}
//               </p>
//             </div>

//             {contact.unreadCount > 0 && (
//               <Badge badgeContent={contact.unreadCount} color="primary" />
//             )}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MessengerChatList;


import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import { useState } from 'react';
import ChatConversionTooltip from '../ChatConversionTooltip';

const MessengerChatList = ({ contacts, selectedContact, currentAgentId, lockForHandlersOnly, onSelectContact }) => {
  const [filter, setFilter] = useState('UNREAD');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = contacts
    .filter((contact) => {
      if (filter === 'UNREAD') return contact.queueStatus === 'unread';
      return contact.queueStatus === 'active';
    })
    .filter((contact) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return `${contact.name} ${contact.lastMessage}`.toLowerCase().includes(query);
    });

  return (
    <div className="messenger-list">
      <div className="messenger-list__header">
        <h2 className="messenger-list__title">Chats</h2>
        <div className="messenger-list__search">
          <SearchIcon className="messenger-list__search-icon" sx={{ fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search Messenger"
            className="messenger-list__search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="messenger-list__filters">
        <Chip
          label="Pending"
          size="small"
          color="primary"
          variant={filter === 'UNREAD' ? 'filled' : 'outlined'}
          onClick={() => setFilter('UNREAD')}
          sx={{ borderColor: '#0084FF', color: filter === 'UNREAD' ? '#fff' : '#0084FF',
                bgcolor: filter === 'UNREAD' ? '#0084FF' : 'transparent', fontSize: 11 }}
        />
        <Chip
          label="Activated"
          size="small"
          variant={filter === 'ACTIVE' ? 'filled' : 'outlined'}
          onClick={() => setFilter('ACTIVE')}
          sx={{ borderColor: '#0084FF', color: filter === 'ACTIVE' ? '#fff' : '#0084FF',
                bgcolor: filter === 'ACTIVE' ? '#0084FF' : 'transparent', fontSize: 11 }}
        />
      </div>

      <div className="messenger-list__contacts">
        {filtered.map((contact) => {
          const isAssignedToOtherAgent = Boolean(
            lockForHandlersOnly && contact.assignedAgentId && contact.assignedAgentId !== currentAgentId,
          );

          return (
          <ChatConversionTooltip key={contact.id} contact={contact}>
            <button
              onClick={() => !isAssignedToOtherAgent && onSelectContact(contact)}
              disabled={isAssignedToOtherAgent}
              className={`messenger-list__item ${
                selectedContact?.id === contact.id ? 'messenger-list__item--active' : ''
              } ${isAssignedToOtherAgent ? 'messenger-list__item--disabled' : ''}`}
            >
              <div className="messenger-list__avatar">
                <div className="messenger-list__avatar-circle">
                  {contact.name.charAt(0)}
                </div>
                {contact.online && <div className="messenger-list__online-dot" />}
              </div>

              <div className="messenger-list__info">
                <div className="messenger-list__name-row">
                  <span className={`messenger-list__name ${
                    contact.unreadCount > 0 ? 'messenger-list__name--unread' : ''
                  }`}>
                    {contact.name}
                  </span>
                  <span className="messenger-list__time">{contact.lastMessageTime}</span>
                </div>
                <p className={`messenger-list__preview ${
                  contact.unreadCount > 0 ? 'messenger-list__preview--unread' : ''
                }`}>
                  {contact.lastMessage}
                </p>
                {contact.assignedAgentId && (
                  <p className="social-chat-assignee">
                    Assigned to {contact.assignedAgentName || contact.assignedAgentId}
                  </p>
                )}
              </div>

              {contact.unreadCount > 0 && (
                <div className="messenger-list__unread-badge">{contact.unreadCount}</div>
              )}
            </button>
          </ChatConversionTooltip>
          );
        })}
      </div>
    </div>
  );
};

export default MessengerChatList;
