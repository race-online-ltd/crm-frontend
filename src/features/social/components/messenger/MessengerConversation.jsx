// import IconButton from '@mui/material/IconButton';
// import SendIcon from '@mui/icons-material/Send';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// import ImageIcon from '@mui/icons-material/Image';
// import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
// import AddCircleIcon from '@mui/icons-material/AddCircle';
// import PhoneIcon from '@mui/icons-material/Phone';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import InfoIcon from '@mui/icons-material/Info';
// import { useState } from 'react';

// const MessengerConversation = ({ contact, messages }) => {
//   const [input, setInput] = useState('');

//   return (
//     <div className="messenger-conv">
//       <div className="messenger-conv__header">
//         <div className="messenger-conv__header-left">
//           <div className="messenger-conv__avatar">
//             <div className="messenger-conv__avatar-circle">
//               {contact.name.charAt(0)}
//             </div>
//             {contact.online && <div className="messenger-conv__online-dot" />}
//           </div>
//           <div>
//             <h3 className="messenger-conv__name">{contact.name}</h3>
//             <p className="messenger-conv__status">{contact.online ? 'Active now' : 'Offline'}</p>
//           </div>
//         </div>
//         <div className="messenger-conv__actions">
//           <IconButton size="small" sx={{ color: '#0084FF' }}><PhoneIcon fontSize="small" /></IconButton>
//           <IconButton size="small" sx={{ color: '#0084FF' }}><VideocamIcon fontSize="small" /></IconButton>
//           <IconButton size="small" sx={{ color: '#0084FF' }}><InfoIcon fontSize="small" /></IconButton>
//         </div>
//       </div>

//       <div className="messenger-conv__messages">
//         {messages.map((msg) => (
//           <div key={msg.id} className={`messenger-conv__msg-row ${msg.isOwn ? 'messenger-conv__msg-row--own' : 'messenger-conv__msg-row--other'}`}>
//             <div className={`messenger-conv__bubble ${msg.isOwn ? 'messenger-conv__bubble--own' : 'messenger-conv__bubble--other'}`}>
//               {msg.content}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="messenger-conv__input-bar">
//         <IconButton size="small" sx={{ color: '#0084FF' }}><AddCircleIcon /></IconButton>
//         <IconButton size="small" sx={{ color: '#0084FF' }}><ImageIcon /></IconButton>
//         <IconButton size="small" sx={{ color: '#0084FF' }}><EmojiEmotionsIcon /></IconButton>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Aa"
//           className="messenger-conv__input"
//         />
//         <IconButton size="small" sx={{ color: '#0084FF' }}>
//           {input.trim() ? <SendIcon /> : <ThumbUpIcon />}
//         </IconButton>
//       </div>
//     </div>
//   );
// };

// export default MessengerConversation;
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useState } from 'react';
import SocialConversationActions from '../SocialConversationActions';

const MessengerConversation = ({ contact, messages, backBtn, releaseBtn }) => {
  const [input, setInput] = useState('');

  return (
    <div className="messenger-conv">
      <div className="messenger-conv__header">
        <div className="messenger-conv__header-left">
          {releaseBtn}
          {backBtn}
          <div className="messenger-conv__avatar">
            <div className="messenger-conv__avatar-circle">
              {contact.name.charAt(0)}
            </div>
            {contact.online && <div className="messenger-conv__online-dot" />}
          </div>
          <div>
            <h3 className="messenger-conv__name">{contact.name}</h3>
            <p className="messenger-conv__status">
              {contact.online ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="messenger-conv__actions">
          <SocialConversationActions
            primaryButtonSx={{
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
            secondaryButtonSx={{
              color: '#0084FF',
              borderColor: '#0084FF',
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              '&:hover': {
                borderColor: '#006fe0',
                backgroundColor: 'rgba(0, 132, 255, 0.06)',
              },
            }}
            tertiaryButtonSx={{
              color: '#475569',
              borderColor: '#cbd5e1',
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              backgroundColor: '#fff',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc',
              },
            }}
          />
        </div>
      </div>

      <div className="messenger-conv__messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`messenger-conv__msg-row ${
              msg.isOwn
                ? 'messenger-conv__msg-row--own'
                : 'messenger-conv__msg-row--other'
            }`}
          >
            <div
              className={`messenger-conv__bubble ${
                msg.isOwn
                  ? 'messenger-conv__bubble--own'
                  : 'messenger-conv__bubble--other'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="messenger-conv__input-bar">
        <IconButton size="small" sx={{ color: '#0084FF' }}><AddCircleIcon /></IconButton>
        <IconButton size="small" sx={{ color: '#0084FF' }}><ImageIcon /></IconButton>
        <IconButton size="small" sx={{ color: '#0084FF' }}><EmojiEmotionsIcon /></IconButton>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Aa"
          className="messenger-conv__input"
        />
        <IconButton size="small" sx={{ color: '#0084FF' }}>
          {input.trim() ? <SendIcon /> : <span style={{ fontSize: 18 }}>👍</span>}
        </IconButton>
      </div>
    </div>
  );
};

export default MessengerConversation;
