// src/components/messaging/MessagingLayout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import './BaseSocialMedia.css';

// API
import COMPANIES from '../api/Companies.js';

const PLATFORMS = [
  { key: 'Facebook', emoji: '💬', label: 'Facebook' },
  { key: 'Whatsapp', emoji: '📱', label: 'Whatsapp' },
  { key: 'Email',    emoji: '✉️',  label: 'Email'    },
];
// const COMPANIES = [
//   { id: 1, name: 'Race Online Ltd.', initial: 'R' },
//   { id: 2, name: 'Earth Telecom',    initial: 'E' },
//   { id: 3, name: 'Dhaka COLO',       initial: 'D' },
// ];
const TAB_COLORS = {
  Facebook: { active: '#0084ff', shadow: 'rgba(0,132,255,0.28)' },
  Whatsapp: { active: '#25d366', shadow: 'rgba(37,211,102,0.28)' },
  Email:    { active: '#0078d4', shadow: 'rgba(0,120,212,0.28)' },
};

export default function BaseSocialMedia() {
  const [platform,      setPlatform]      = useState('Facebook');
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [activeCompany, setActiveCompany] = useState(1);
  const [mobileView,    setMobileView]    = useState('sidebar');

  const handleSelectUser = (user) => { setSelectedUser(user); setMobileView('chat'); };
  const handleBack       = ()     => { setMobileView('sidebar'); setSelectedUser(null); };
  const handlePlatform   = (p)    => { setPlatform(p); setSelectedUser(null); setMobileView('sidebar'); };

  return (
    <div className="mly-root">
      <main className="mly-body">

        {/* Company Cards */}
        <section className="mly-companies">
          {COMPANIES.map((c) => (
            <button key={c.id} className={`mly-company-card ${activeCompany === c.id ? 'mly-company-active' : ''}`} onClick={() => setActiveCompany(c.id)}>
              <div className="mly-company-logo">{c.initial}</div>
              {/* <div className="mly-company-logo">
                {c.logo ? (
                  <img src={c.logo} alt={c.name} />
                ) : (
                  c.initial
                )}
              </div> */}
              <span className="mly-company-name">{c.name}</span>
            </button>
          ))}
        </section>

        {/* Platform Tabs */}
        <section className="mly-tabs">
          {PLATFORMS.map(({ key, emoji, label }) => {
            const isActive = platform === key;
            const col      = TAB_COLORS[key];
            return (
              <button key={key} className={`mly-tab ${isActive ? 'mly-tab-active' : ''}`}
                style={isActive ? { background: col.active, borderColor: col.active, boxShadow: `0 3px 10px ${col.shadow}`, color: '#fff' } : {}}
                onClick={() => handlePlatform(key)}>
                <span className="mly-tab-emoji">{emoji}</span>{label}
              </button>
            );
          })}
        </section>

        {/* Main Panel */}
        <div className="mly-panel">
          <aside className={`mly-sidebar ${mobileView === 'chat' ? 'mly-hide' : ''}`}>
            <Sidebar platform={platform} onSelectUser={handleSelectUser} selectedUser={selectedUser} />
          </aside>
          <section className={`mly-chatwin ${mobileView === 'sidebar' ? 'mly-hide' : ''}`}>
            <ChatWindow user={selectedUser} onBack={handleBack} />
          </section>
        </div>

      </main>
    </div>
  );
}