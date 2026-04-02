// import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
// import { useSocial } from '../context/SocialContext';
// import { getContacts, getMessages } from '../data/mockData';
// import MessengerChatList from './messenger/MessengerChatList';
// import MessengerConversation from './messenger/MessengerConversation';
// import WhatsAppChatList from './whatsapp/WhatsAppChatList';
// import WhatsAppConversation from './whatsapp/WhatsAppConversation';
// import EmailList from './email/EmailList';
// import EmailConversation from './email/EmailConversation';

// const SocialInbox = () => {
//   const { activeEntity, activeMedium, selectedContact, setSelectedContact } = useSocial();
//   const contacts = getContacts(activeEntity, activeMedium);
//   const messages = selectedContact ? getMessages(selectedContact.id, activeMedium) : [];

//   const renderChatList = () => {
//     switch (activeMedium) {
//       case 'messenger':
//         return <MessengerChatList contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />;
//       case 'whatsapp':
//         return <WhatsAppChatList contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />;
//       case 'email':
//         return <EmailList contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />;
//     }
//   };

//   const renderConversation = () => {
//     if (!selectedContact) {
//       return (
//         <div className="empty-conversation">
//           <ChatBubbleOutlineIcon sx={{ fontSize: 48 }} />
//           <p>Select a conversation to start</p>
//         </div>
//       );
//     }

//     switch (activeMedium) {
//       case 'messenger':
//         return <MessengerConversation contact={selectedContact} messages={messages} />;
//       case 'whatsapp':
//         return <WhatsAppConversation contact={selectedContact} messages={messages} />;
//       case 'email':
//         return <EmailConversation contact={selectedContact} messages={messages} />;
//     }
//   };

//   return (
//     <div className="social-inbox">
//       <div className="social-inbox__chat-list">
//         {renderChatList()}
//       </div>
//       <div className="social-inbox__conversation">
//         {renderConversation()}
//       </div>
//     </div>
//   );
// };

// export default SocialInbox;




import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useSocial } from '../context/SocialContext';
import { getContacts, getMessages } from '../data/mockData';
import MessengerChatList from './messenger/MessengerChatList';
import MessengerConversation from './messenger/MessengerConversation';
import WhatsAppChatList from './whatsapp/WhatsAppChatList';
import WhatsAppConversation from './whatsapp/WhatsAppConversation';
import EmailList from './email/EmailList';
import EmailConversation from './email/EmailConversation';

const SocialInbox = () => {
  const { activeEntity, activeMedium, selectedContact, setSelectedContact } = useSocial();
  const contacts = getContacts(activeEntity, activeMedium);
  const messages = selectedContact ? getMessages(selectedContact.id, activeMedium) : [];

  const handleBack = () => setSelectedContact(null);

  const renderChatList = () => {
    switch (activeMedium) {
      case 'messenger':
        return <MessengerChatList contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />;
      case 'whatsapp':
        return <WhatsAppChatList contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />;
      case 'email':
        return <EmailList contacts={contacts} selectedContact={selectedContact} onSelectContact={setSelectedContact} />;
      default:
        return null;
    }
  };

  const renderConversation = () => {
    if (!selectedContact) {
      return (
        <div className="empty-conversation">
          <ChatBubbleOutlineIcon sx={{ fontSize: 48 }} />
          <p>Select a conversation to start</p>
        </div>
      );
    }

    const backBtn = (
      <IconButton
        size="small"
        onClick={handleBack}
        className="conv-back-btn"
        sx={{ display: { xs: 'flex', md: 'none' } }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>
    );

    switch (activeMedium) {
      case 'messenger':
        return <MessengerConversation contact={selectedContact} messages={messages} backBtn={backBtn} />;
      case 'whatsapp':
        return <WhatsAppConversation contact={selectedContact} messages={messages} backBtn={backBtn} />;
      case 'email':
        return <EmailConversation contact={selectedContact} messages={messages} backBtn={backBtn} />;
      default:
        return null;
    }
  };

  return (
    <div className="social-inbox">
      <div className={`social-inbox__chat-list ${selectedContact ? 'social-inbox__chat-list--hidden' : ''}`}>
        {renderChatList()}
      </div>
      <div className={`social-inbox__conversation ${selectedContact ? 'social-inbox__conversation--visible' : ''}`}>
        {renderConversation()}
      </div>
    </div>
  );
};

export default SocialInbox;