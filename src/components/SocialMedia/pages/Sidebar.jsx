// src/components/messaging/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';

const DUMMY_CONVERSATIONS = [
  { id: '1', name: 'Rahim Ahmed',    lastMsg: 'Sure, which package?',    platform: 'Facebook', time: '2m',        avatar: 'RA', color: '#0084ff', unread: 2, online: true  },
  { id: '2', name: 'Nadia Islam',    lastMsg: 'Thanks! Talk later 😊',   platform: 'Facebook', time: '3h',        avatar: 'NI', color: '#a855f7', unread: 0, online: true  },
  { id: '3', name: 'Kamal Uddin',    lastMsg: 'Can you send the file?',  platform: 'Facebook', time: 'Yesterday', avatar: 'KU', color: '#f59e0b', unread: 0, online: false },
  { id: '4', name: 'Tanvir Hossain', lastMsg: 'I need support.',         platform: 'Whatsapp', time: '15m',       avatar: 'TH', color: '#25D366', unread: 3, online: true  },
  { id: '5', name: 'Sara Karim',     lastMsg: 'Got the invoice, thanks!',platform: 'Whatsapp', time: '1h',        avatar: 'SK', color: '#128c7e', unread: 0, online: false },
  { id: '6', name: 'Jaber Hossain',  lastMsg: 'Please resend the doc',   platform: 'Whatsapp', time: 'Yesterday', avatar: 'JH', color: '#075e54', unread: 1, online: true  },
  { id: '7', name: 'Sara Karim',     lastMsg: 'Invoice received.',       platform: 'Email',    time: '10:20 AM',  avatar: 'SK', color: '#0078d4', unread: 1, online: false },
  { id: '8', name: 'Tanvir Hossain', lastMsg: 'Please review the file.', platform: 'Email',    time: 'Yesterday', avatar: 'TH', color: '#004b87', unread: 0, online: false },
  { id: '9', name: 'Rafi Uddin',     lastMsg: 'Meeting rescheduled.',    platform: 'Email',    time: 'Mon',       avatar: 'RU', color: '#106ebe', unread: 2, online: false },
];

const PLATFORM_CONFIG = {
  Facebook: { accent: '#0084ff', headerBg: '#ffffff', headerText: '#050505', subText: '#65676b', searchBg: '#f0f2f5', searchText: '#65676b', title: 'Chats',     placeholder: 'Search Messenger' },
  Whatsapp: { accent: '#25d366', headerBg: '#075e54', headerText: '#ffffff', subText: 'rgba(255,255,255,0.75)', searchBg: 'rgba(255,255,255,0.15)', searchText: 'rgba(255,255,255,0.8)', title: 'WhatsApp', placeholder: 'Search or start new chat' },
  Email:    { accent: '#0078d4', headerBg: '#0078d4', headerText: '#ffffff', subText: 'rgba(255,255,255,0.75)', searchBg: 'rgba(255,255,255,0.15)', searchText: 'rgba(255,255,255,0.8)', title: 'Inbox',    placeholder: 'Search mail' },
};

export default function Sidebar({ platform, onSelectUser, selectedUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const cfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.Facebook;
  const isOutlook = platform === 'Email';
  const isWA      = platform === 'Whatsapp';

  const filteredChats = DUMMY_CONVERSATIONS.filter(
    (c) => c.platform === platform && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="msdr-sidebar">

      {/* Header */}
      <div className="msdr-header" style={{ background: cfg.headerBg }}>
        <div className="msdr-title-row">
          <h1 className="msdr-title" style={{ color: cfg.headerText }}>{cfg.title}</h1>
          {isOutlook ? (
            <button className="msdr-new-mail-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              New
            </button>
          ) : (
            <button className="msdr-icon-btn" style={{ background: isWA ? 'rgba(255,255,255,0.15)' : '#f0f2f5', color: isWA ? '#fff' : cfg.accent }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="msdr-search" style={{ background: cfg.searchBg }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cfg.searchText} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            className="msdr-search-input"
            placeholder={cfg.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ color: isWA || isOutlook ? '#fff' : '#050505' }}
          />
        </div>

        {/* Outlook: Focused / Other tabs */}
        {isOutlook && (
          <div className="msdr-outlook-tabs">
            <button className="msdr-outlook-tab active">Focused</button>
            <button className="msdr-outlook-tab">Other</button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="msdr-list">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) =>
            isOutlook
              ? <OutlookRow key={chat.id} chat={chat} selected={selectedUser?.id === chat.id} onSelect={onSelectUser} accent={cfg.accent} />
              : <ChatRow    key={chat.id} chat={chat} selected={selectedUser?.id === chat.id} onSelect={onSelectUser} accent={cfg.accent} isWA={isWA} />
          )
        ) : (
          <div className="msdr-empty">
            <div className="msdr-empty-icon">{isOutlook ? '📧' : '💬'}</div>
            <p>No {platform} messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatRow({ chat, selected, onSelect, accent, isWA }) {
  return (
    <button className={`msdr-chat-row ${selected ? 'msdr-selected' : ''}`} onClick={() => onSelect(chat)}
      style={{ '--accent': accent, borderLeft: selected ? `4px solid ${accent}` : '4px solid transparent' }}>
      <div className="msdr-avatar-wrap">
        <div className="msdr-avatar" style={{ background: `linear-gradient(135deg, ${chat.color}bb, ${chat.color})` }}>
          {chat.avatar}
        </div>
        {chat.online && <span className="msdr-online" style={{ background: isWA ? '#25d366' : '#31a24c' }} />}
      </div>
      <div className="msdr-chat-info">
        <div className="msdr-chat-top">
          <span className={`msdr-chat-name ${chat.unread ? 'msdr-bold' : ''}`}>{chat.name}</span>
          <span className="msdr-chat-time" style={chat.unread ? { color: accent, fontWeight: 700 } : {}}>{chat.time}</span>
        </div>
        <div className="msdr-chat-bottom">
          <span className={`msdr-chat-preview ${chat.unread ? 'msdr-bold' : ''}`}>{chat.lastMsg}</span>
          {chat.unread > 0 && <span className="msdr-badge" style={{ background: accent }}>{chat.unread}</span>}
        </div>
      </div>
    </button>
  );
}

function OutlookRow({ chat, selected, onSelect, accent }) {
  return (
    <button className={`msdr-outlook-row ${selected ? 'msdr-outlook-selected' : ''} ${chat.unread ? 'msdr-outlook-unread' : ''}`}
      onClick={() => onSelect(chat)}
      style={{ borderLeft: selected ? `3px solid ${accent}` : '3px solid transparent' }}>
      <div className="msdr-avatar msdr-outlook-avatar" style={{ background: `linear-gradient(135deg, ${chat.color}bb, ${chat.color})` }}>
        {chat.avatar}
      </div>
      <div className="msdr-outlook-info">
        <div className="msdr-outlook-top">
          <span className="msdr-outlook-sender">{chat.name}</span>
          <span className="msdr-outlook-time">{chat.time}</span>
        </div>
        <div className="msdr-outlook-subject">RE: {chat.lastMsg}</div>
        <div className="msdr-outlook-preview">Click to view the email thread</div>
      </div>
      {chat.unread > 0 && <span className="msdr-outlook-dot" style={{ background: accent }} />}
    </button>
  );
}