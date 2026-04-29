import SocialConversationActions from '../SocialConversationActions';

const EmailConversation = ({ contact, messages, backBtn, releaseBtn }) => {
  const subject = messages[0]?.subject || 'No Subject';

  return (
    <div className="email-conv">
      <div className="email-conv__toolbar">
        <div className="email-conv__toolbar-left">
          {releaseBtn}
          {backBtn}
        </div>
        <div className="email-conv__toolbar-actions">
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
              color: '#0078D4',
              borderColor: '#0078D4',
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 50,
              '&:hover': {
                borderColor: '#0062ad',
                backgroundColor: 'rgba(0, 120, 212, 0.06)',
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
    </div>
  );
};

export default EmailConversation;
