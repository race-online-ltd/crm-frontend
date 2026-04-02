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
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import { useState } from 'react';

const MessengerChatList = ({ contacts, selectedContact, onSelectContact }) => {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'UNREAD'
    ? contacts.filter((c) => c.unreadCount > 0)
    : contacts;

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
          />
        </div>
      </div>

      {/* Filter chips — same pattern as EmailList */}
      <div className="messenger-list__filters">
        <Chip
          label="All"
          size="small"
          color="primary"
          variant={filter === 'ALL' ? 'filled' : 'outlined'}
          onClick={() => setFilter('ALL')}
          sx={{ borderColor: '#0084FF', color: filter === 'ALL' ? '#fff' : '#0084FF',
                bgcolor: filter === 'ALL' ? '#0084FF' : 'transparent', fontSize: 11 }}
        />
        <Chip
          label="Unread"
          size="small"
          variant={filter === 'UNREAD' ? 'filled' : 'outlined'}
          onClick={() => setFilter('UNREAD')}
          sx={{ borderColor: '#0084FF', color: filter === 'UNREAD' ? '#fff' : '#0084FF',
                bgcolor: filter === 'UNREAD' ? '#0084FF' : 'transparent', fontSize: 11 }}
        />
      </div>

      <div className="messenger-list__contacts">
        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`messenger-list__item ${
              selectedContact?.id === contact.id ? 'messenger-list__item--active' : ''
            }`}
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
            </div>

            {contact.unreadCount > 0 && (
              <div className="messenger-list__unread-badge">{contact.unreadCount}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessengerChatList;