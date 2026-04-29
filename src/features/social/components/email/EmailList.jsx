// import React, { useState } from 'react';
// import SearchIcon from '@mui/icons-material/Search';
// import Chip from '@mui/material/Chip';

// const EmailList = ({ contacts, selectedContact, onSelectContact }) => {
//   const [filter, setFilter] = useState('ALL');

//   // ✅ Apply filter
//   const filteredContacts =
//     filter === 'UNREAD'
//       ? contacts.filter((c) => c.unreadCount > 0)
//       : contacts;

//   return (
//     <div className="email-list">
//       <div className="email-list__header">
//         <h2 className="email-list__title">Inbox</h2>
//       </div>

//       {/* Search */}
//       <div className="email-list__search">
//         <div className="email-list__search-wrapper">
//           <SearchIcon sx={{ fontSize: 18 }} />
//           <input
//             type="text"
//             placeholder="Search mail"
//             className="email-list__search-input"
//           />
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="email-list__filters">
//         <Chip
//           label="All"
//           size="small"
//           color="primary"
//           variant={filter === 'ALL' ? 'filled' : 'outlined'}
//           onClick={() => setFilter('ALL')}
//         />

//         <Chip
//           label="Unread"
//           size="small"
//           color="primary"
//           variant={filter === 'UNREAD' ? 'filled' : 'outlined'}
//           onClick={() => setFilter('UNREAD')}
//         />
//       </div>

//       {/* Contacts */}
//       <div className="email-list__contacts">
//         {filteredContacts.map((contact) => (
//           <button
//             key={contact.id}
//             onClick={() => onSelectContact(contact)}
//             className={`email-list__item ${
//               selectedContact?.id === contact.id
//                 ? 'email-list__item--active'
//                 : ''
//             }`}
//           >
//             <div className="email-list__item-content">
//               <div
//                 className={`email-list__unread-dot ${
//                   contact.unreadCount > 0
//                     ? 'email-list__unread-dot--active'
//                     : 'email-list__unread-dot--inactive'
//                 }`}
//               />

//               <div className="email-list__info">
//                 <div className="email-list__name-row">
//                   <span
//                     className={`email-list__name ${
//                       contact.unreadCount > 0
//                         ? 'email-list__name--unread'
//                         : ''
//                     }`}
//                   >
//                     {contact.name}
//                   </span>
//                   <span className="email-list__time">
//                     {contact.lastMessageTime}
//                   </span>
//                 </div>

//                 <p
//                   className={`email-list__preview ${
//                     contact.unreadCount > 0
//                       ? 'email-list__preview--unread'
//                       : ''
//                   }`}
//                 >
//                   {contact.lastMessage}
//                 </p>
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EmailList;

import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import ChatConversionTooltip from '../ChatConversionTooltip';
import { CHAT_FILTERS, getFilteredContacts } from '../chatListUtils';

const EmailList = ({ contacts, selectedContact, currentAgentId, onSelectContact }) => {
  const [filter, setFilter] = useState(CHAT_FILTERS.UNREAD);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedContact?.queueStatus === 'active') {
      setFilter(CHAT_FILTERS.ACTIVE);
    }
  }, [selectedContact]);

  const filteredContacts = getFilteredContacts({
    contacts,
    filter,
    searchQuery,
    currentAgentId,
  });

  return (
    <div className="email-list">
      <div className="email-list__header">
        <h2 className="email-list__title">Inbox</h2>
      </div>

      {/* Search */}
      <div className="email-list__search">
        <div className="email-list__search-wrapper">
          <SearchIcon className="email-list__search-icon" sx={{ fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search mail"
            className="email-list__search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="email-list__filters">
        <Chip
          label="Pending"
          size="small"
          color="primary"
          variant={filter === CHAT_FILTERS.UNREAD ? 'filled' : 'outlined'}
          onClick={() => setFilter(CHAT_FILTERS.UNREAD)}
        />
        <Chip
          label="Activated"
          size="small"
          color="primary"
          variant={filter === CHAT_FILTERS.ACTIVE ? 'filled' : 'outlined'}
          onClick={() => setFilter(CHAT_FILTERS.ACTIVE)}
        />
      </div>

      <div className="email-list__contacts">
        {filteredContacts.map((contact) => {
          const isAssignedToOtherAgent = Boolean(contact.assignedAgentId && contact.assignedAgentId !== currentAgentId);

          return (
          <ChatConversionTooltip key={contact.id} contact={contact}>
            <button
              onClick={() => !isAssignedToOtherAgent && onSelectContact(contact)}
              disabled={isAssignedToOtherAgent}
              className={`email-list__item ${
                selectedContact?.id === contact.id ? 'email-list__item--active' : ''
              } ${isAssignedToOtherAgent ? 'email-list__item--disabled' : ''}`}
            >
              <div className="email-list__item-content">
                <div
                  className={`email-list__unread-dot ${
                    contact.unreadCount > 0
                      ? 'email-list__unread-dot--active'
                      : 'email-list__unread-dot--inactive'
                  }`}
                />
                <div className="email-list__info">
                  <div className="email-list__name-row">
                    <span
                      className={`email-list__name ${
                        contact.unreadCount > 0 ? 'email-list__name--unread' : ''
                      }`}
                    >
                      {contact.name}
                    </span>
                    <span className="email-list__time">{contact.lastMessageTime}</span>
                  </div>
                  <p
                    className={`email-list__preview ${
                      contact.unreadCount > 0 ? 'email-list__preview--unread' : ''
                    }`}
                  >
                    {contact.lastMessage}
                  </p>
                  {contact.assignedAgentId && (
                    <p className="social-chat-assignee">
                      Assigned to {contact.assignedAgentName || contact.assignedAgentId}
                    </p>
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

export default EmailList;
