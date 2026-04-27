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
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSocial } from '../context/SocialContext';
import MessengerChatList from './messenger/MessengerChatList';
import MessengerConversation from './messenger/MessengerConversation';
import WhatsAppChatList from './whatsapp/WhatsAppChatList';
import WhatsAppConversation from './whatsapp/WhatsAppConversation';
import EmailList from './email/EmailList';
import EmailConversation from './email/EmailConversation';
import ChatPickDialog from './ChatPickDialog';

const SocialInbox = () => {
  const {
    activeMedium,
    contacts,
    messages,
    selectedContact,
    setSelectedContact,
    requestChatSelection,
    pendingChat,
    closePickDialog,
    confirmPickChat,
    isPickingChat,
    currentAgent,
    canHandleSocial,
    isAccessLoading,
  } = useSocial();

  const handleBack = () => setSelectedContact(null);

  const renderChatList = () => {
    switch (activeMedium) {
      case 'messenger':
        return (
          <MessengerChatList
            contacts={contacts}
            selectedContact={selectedContact}
            currentAgentId={currentAgent.id}
            lockForHandlersOnly={canHandleSocial}
            onSelectContact={requestChatSelection}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppChatList
            contacts={contacts}
            selectedContact={selectedContact}
            currentAgentId={currentAgent.id}
            lockForHandlersOnly={canHandleSocial}
            onSelectContact={requestChatSelection}
          />
        );
      case 'email':
        return (
          <EmailList
            contacts={contacts}
            selectedContact={selectedContact}
            currentAgentId={currentAgent.id}
            lockForHandlersOnly={canHandleSocial}
            onSelectContact={requestChatSelection}
          />
        );
      default:
        return null;
    }
  };

  const renderConversation = () => {
    if (isAccessLoading) {
      return (
        <div className="empty-conversation">
          <CircularProgress size={28} />
          <Typography mt={1.5} fontSize={14} color="#64748b">
            Loading social access...
          </Typography>
        </div>
      );
    }

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
        return (
          <MessengerConversation
            contact={selectedContact}
            messages={messages}
            backBtn={backBtn}
            composerDisabled={!canHandleSocial}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppConversation
            contact={selectedContact}
            messages={messages}
            backBtn={backBtn}
            composerDisabled={!canHandleSocial}
          />
        );
      case 'email':
        return (
          <EmailConversation
            contact={selectedContact}
            messages={messages}
            backBtn={backBtn}
            composerDisabled={!canHandleSocial}
          />
        );
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
      <ChatPickDialog
        open={canHandleSocial && Boolean(pendingChat)}
        chat={pendingChat}
        loading={isPickingChat}
        onClose={closePickDialog}
        onConfirm={confirmPickChat}
      />
    </div>
  );
};

export default SocialInbox;
