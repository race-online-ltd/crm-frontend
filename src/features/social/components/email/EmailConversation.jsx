import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ReplyIcon from '@mui/icons-material/Reply';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import ForwardIcon from '@mui/icons-material/Forward';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import { useState } from 'react';

const EmailConversation = ({ contact, messages }) => {
  // const [replyOpen, setReplyOpen] = useState(false);
  // const [replyText, setReplyText] = useState('');
  const subject = messages[0]?.subject || 'No Subject';

  return (
    <div className="email-conv">
      <div className="email-conv__toolbar">
        {/* <Button size="small" startIcon={<ReplyIcon />} sx={{ textTransform: 'none', color: '#424242', fontSize: 12 }}>Reply</Button>
        <Button size="small" startIcon={<ReplyAllIcon />} sx={{ textTransform: 'none', color: '#424242', fontSize: 12 }}>Reply All</Button>
        <Button size="small" startIcon={<ForwardIcon />} sx={{ textTransform: 'none', color: '#424242', fontSize: 12 }}>Forward</Button>
        <div className="email-conv__toolbar-divider" />
        <IconButton size="small" sx={{ color: '#424242' }}><ArchiveIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#424242' }}><DeleteIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#424242' }}><FlagIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#424242', marginLeft: 'auto' }}><MoreHorizIcon fontSize="small" /></IconButton> */}
         <Button size="small" variant="contained"
          sx={{
            marginLeft: "auto",
            textTransform: "none",
            fontSize: 12,
            borderRadius: 50,
          }}
          >
            Convert +
          </Button>
      </div>
      {/* <div className="email-conv__toolbar">
        <Button size="small" startIcon={<ReplyIcon />} sx={{ textTransform: 'none', color: '#424242', fontSize: 12 }}>Reply</Button>
        <Button size="small" startIcon={<ReplyAllIcon />} sx={{ textTransform: 'none', color: '#424242', fontSize: 12 }}>Reply All</Button>
        <Button size="small" startIcon={<ForwardIcon />} sx={{ textTransform: 'none', color: '#424242', fontSize: 12 }}>Forward</Button>
        <div className="email-conv__toolbar-divider" />
        <IconButton size="small" sx={{ color: '#424242' }}><ArchiveIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#424242' }}><DeleteIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#424242' }}><FlagIcon fontSize="small" /></IconButton>
        <IconButton size="small" sx={{ color: '#424242', marginLeft: 'auto' }}><MoreHorizIcon fontSize="small" /></IconButton>
      </div> */}

      <div className="email-conv__subject">
        <h2>{subject}</h2>
      </div>

      <div className="email-conv__messages">
        {messages.map((msg) => (
          <div key={msg.id} className="email-conv__message">
            <div className="email-conv__msg-header">
              <div className="email-conv__msg-avatar">
                {msg.senderName.charAt(0)}
              </div>
              <div className="email-conv__msg-info">
                <div className="email-conv__msg-name-row">
                  <div>
                    <span className="email-conv__msg-sender">{msg.senderName}</span>
                    {msg.isOwn && <span className="email-conv__msg-recipient">to {contact.name}</span>}
                  </div>
                  <span className="email-conv__msg-time">{msg.timestamp}</span>
                </div>
                <div className="email-conv__msg-body">
                  {msg.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="email-conv__reply">
        {!replyOpen ? (
          <Button
            startIcon={<ReplyIcon />}
            onClick={() => setReplyOpen(true)}
            sx={{ textTransform: 'none', color: '#0078D4' }}
          >
            Reply
          </Button>
        ) : (
          <div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="email-conv__reply-textarea"
              rows={4}
            />
            <div className="email-conv__reply-actions">
              <Button variant="contained" size="small" sx={{ textTransform: 'none', bgcolor: '#0078D4' }}>Send</Button>
              <Button
                size="small"
                onClick={() => { setReplyOpen(false); setReplyText(''); }}
                sx={{ textTransform: 'none', color: '#757575' }}
              >
                Discard
              </Button>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default EmailConversation;
