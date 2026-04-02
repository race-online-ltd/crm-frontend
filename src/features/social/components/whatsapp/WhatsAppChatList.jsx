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
import { useState } from 'react';

const WhatsAppChatList = ({ contacts, selectedContact, onSelectContact }) => {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'UNREAD'
    ? contacts.filter((c) => c.unreadCount > 0)
    : contacts;

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
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="whatsapp-list__filters">
        <Chip
          label="All"
          size="small"
          variant={filter === 'ALL' ? 'filled' : 'outlined'}
          onClick={() => setFilter('ALL')}
          sx={{ borderColor: '#25D366', color: filter === 'ALL' ? '#fff' : '#25D366',
                bgcolor: filter === 'ALL' ? '#25D366' : 'transparent', fontSize: 11 }}
        />
        <Chip
          label="Unread"
          size="small"
          variant={filter === 'UNREAD' ? 'filled' : 'outlined'}
          onClick={() => setFilter('UNREAD')}
          sx={{ borderColor: '#25D366', color: filter === 'UNREAD' ? '#fff' : '#25D366',
                bgcolor: filter === 'UNREAD' ? '#25D366' : 'transparent', fontSize: 11 }}
        />
      </div>

      <div className="whatsapp-list__contacts">
        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`whatsapp-list__item ${
              selectedContact?.id === contact.id ? 'whatsapp-list__item--active' : ''
            }`}
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
                <p className="whatsapp-list__preview">{contact.lastMessage}</p>
                {contact.unreadCount > 0 && (
                  <div className="whatsapp-list__unread-badge">{contact.unreadCount}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WhatsAppChatList;