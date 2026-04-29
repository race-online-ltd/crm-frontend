// import IconButton from '@mui/material/IconButton';
// import SendIcon from '@mui/icons-material/Send';
// import MicIcon from '@mui/icons-material/Mic';
// import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import PhoneIcon from '@mui/icons-material/Phone';
// import SearchIcon from '@mui/icons-material/Search';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import { useState } from 'react';

// const WhatsAppConversation = ({ contact, messages }) => {
//   const [input, setInput] = useState('');

//   return (
//     <div className="whatsapp-conv">
//       <div className="whatsapp-conv__header">
//         <div className="whatsapp-conv__header-left">
//           <div className="whatsapp-conv__avatar">
//             {contact.name.charAt(0)}
//           </div>
//           <div>
//             <h3 className="whatsapp-conv__name">{contact.name}</h3>
//             <p className="whatsapp-conv__status">{contact.online ? 'online' : 'last seen today'}</p>
//           </div>
//         </div>
//         <div className="whatsapp-conv__actions">
//           <IconButton size="small" sx={{ color: '#fff' }}><VideocamIcon fontSize="small" /></IconButton>
//           <IconButton size="small" sx={{ color: '#fff' }}><PhoneIcon fontSize="small" /></IconButton>
//           <IconButton size="small" sx={{ color: '#fff' }}><SearchIcon fontSize="small" /></IconButton>
//           <IconButton size="small" sx={{ color: '#fff' }}><MoreVertIcon fontSize="small" /></IconButton>
//         </div>
//       </div>

//       <div className="whatsapp-conv__messages">
//         {messages.map((msg) => (
//           <div key={msg.id} className={`whatsapp-conv__msg-row ${msg.isOwn ? 'whatsapp-conv__msg-row--own' : 'whatsapp-conv__msg-row--other'}`}>
//             <div className={`whatsapp-conv__bubble ${msg.isOwn ? 'whatsapp-conv__bubble--own' : 'whatsapp-conv__bubble--other'}`}>
//               <p>{msg.content}</p>
//               <div className="whatsapp-conv__bubble-meta">
//                 <span className="whatsapp-conv__bubble-time">{msg.timestamp}</span>
//                 {msg.isOwn && (
//                   <span className={`whatsapp-conv__bubble-tick ${msg.status === 'read' ? 'whatsapp-conv__bubble-tick--read' : 'whatsapp-conv__bubble-tick--unread'}`}>✓✓</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="whatsapp-conv__input-bar">
//         <IconButton size="small" sx={{ color: '#54656F' }}><EmojiEmotionsIcon /></IconButton>
//         <IconButton size="small" sx={{ color: '#54656F' }}><AttachFileIcon /></IconButton>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type a message"
//           className="whatsapp-conv__input"
//         />
//         <IconButton size="small" sx={{ color: '#54656F' }}>
//           {input.trim() ? <SendIcon /> : <MicIcon />}
//         </IconButton>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppConversation;
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useState } from 'react';
import SocialConversationActions from '../SocialConversationActions';

const WhatsAppConversation = ({ contact, messages, backBtn, releaseBtn }) => {
  const [input, setInput] = useState('');

  return (
    <div className="whatsapp-conv">
      <div className="whatsapp-conv__header">
        <div className="whatsapp-conv__header-left">
          {releaseBtn}
          {backBtn}
          <div className="whatsapp-conv__avatar">
            {contact.name.charAt(0)}
          </div>
          <div>
            <h3 className="whatsapp-conv__name">{contact.name}</h3>
            <p className="whatsapp-conv__status">
              {contact.online ? 'online' : 'last seen today'}
            </p>
          </div>
        </div>
        <div className="whatsapp-conv__actions">
          <SocialConversationActions
            primaryButtonSx={{
              backgroundColor: '#25D366',
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#1ebe5a',
                boxShadow: 'none',
              },
            }}
            secondaryButtonSx={{
              color: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
            tertiaryButtonSx={{
              color: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
              },
            }}
          />
        </div>
      </div>

      <div className="whatsapp-conv__messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`whatsapp-conv__msg-row ${
              msg.isOwn
                ? 'whatsapp-conv__msg-row--own'
                : 'whatsapp-conv__msg-row--other'
            }`}
          >
            <div
              className={`whatsapp-conv__bubble ${
                msg.isOwn
                  ? 'whatsapp-conv__bubble--own'
                  : 'whatsapp-conv__bubble--other'
              }`}
            >
              <p>{msg.content}</p>
              <div className="whatsapp-conv__bubble-meta">
                <span className="whatsapp-conv__bubble-time">{msg.timestamp}</span>
                {msg.isOwn && (
                  <span className={`whatsapp-conv__bubble-tick ${
                    msg.status === 'read'
                      ? 'whatsapp-conv__bubble-tick--read'
                      : 'whatsapp-conv__bubble-tick--unread'
                  }`}>✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="whatsapp-conv__input-bar">
        <IconButton size="small" sx={{ color: '#54656F' }}><EmojiEmotionsIcon /></IconButton>
        <IconButton size="small" sx={{ color: '#54656F' }}><AttachFileIcon /></IconButton>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="whatsapp-conv__input"
        />
        <IconButton size="small" sx={{ color: '#54656F' }}>
          {input.trim() ? <SendIcon /> : <MicIcon />}
        </IconButton>
      </div>
    </div>
  );
};

export default WhatsAppConversation;
