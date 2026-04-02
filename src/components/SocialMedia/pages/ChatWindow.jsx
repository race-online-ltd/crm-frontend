// src/components/messaging/ChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

/* ── Platform Themes ────────────────────────────────────────── */
const THEMES = {
  Facebook: {
    headerBg:        '#ffffff',
    headerBorder:    '#e4e6eb',
    headerText:      '#050505',
    subText:         '#0084ff',
    chatBg:          '#ffffff',
    myBubbleBg:      '#0084ff',
    myBubbleText:    '#ffffff',
    theirBubbleBg:   '#f0f0f0',
    theirBubbleText: '#050505',
    inputAreaBg:     '#ffffff',
    inputBg:         '#f0f2f5',
    inputBorder:     'transparent',
    accentColor:     '#0084ff',
    sendBtnBg:       '#0084ff',
    avatarGradient:  'linear-gradient(135deg,#0084ff,#00c6ff)',
    showEmoji:       true,
    showAttach:      true,
    showLike:        true,
    showCalls:       true,
    statusLabel:     'Active now',
    inputPlaceholder:'Aa',
    bubbleRadius:    '18px',
  },
  Whatsapp: {
    headerBg:        '#075e54',
    headerBorder:    '#054c44',
    headerText:      '#ffffff',
    subText:         'rgba(255,255,255,0.75)',
    chatBg:          '#efeae2',
    myBubbleBg:      '#d9fdd3',
    myBubbleText:    '#111b21',
    theirBubbleBg:   '#ffffff',
    theirBubbleText: '#111b21',
    inputAreaBg:     '#f0f2f5',
    inputBg:         '#ffffff',
    inputBorder:     'transparent',
    accentColor:     '#25d366',
    sendBtnBg:       '#25d366',
    avatarGradient:  'linear-gradient(135deg,#25d366,#128c7e)',
    showEmoji:       true,
    showAttach:      true,
    showLike:        false,
    showCalls:       true,
    statusLabel:     'online',
    inputPlaceholder:'Type a message',
    bubbleRadius:    '8px',
    wallpaper:       true,
    showTicks:       true,
  },
  Email: {
    headerBg:        '#0078d4',
    headerBorder:    '#006cbd',
    headerText:      '#ffffff',
    subText:         'rgba(255,255,255,0.8)',
    chatBg:          '#f3f2f1',
    myBubbleBg:      '#0078d4',
    myBubbleText:    '#ffffff',
    theirBubbleBg:   '#ffffff',
    theirBubbleText: '#323130',
    inputAreaBg:     '#ffffff',
    inputBg:         '#ffffff',
    inputBorder:     '#d2d0ce',
    accentColor:     '#0078d4',
    sendBtnBg:       '#0078d4',
    avatarGradient:  'linear-gradient(135deg,#0078d4,#004b87)',
    showEmoji:       false,
    showAttach:      true,
    showLike:        false,
    showCalls:       false,
    statusLabel:     '',
    inputPlaceholder:'Reply...',
    bubbleRadius:    '4px',
    isEmail:         true,
  },
};

/* ── Dummy Messages ─────────────────────────────────────────── */
const SEED_MESSAGES = [
  { id: 1, text: 'Hi, need pricing info',                                                       isMe: false, time: '10:20 AM' },
  { id: 2, text: 'Sure, which package are you looking for?',                                    isMe: true,  time: '10:21 AM' },
  { id: 3, text: 'The enterprise plan, we have a team of 20',                                   isMe: false, time: '10:22 AM' },
  { id: 4, text: 'Got it! The Enterprise plan is $49/user/month. I can send you the full breakdown.', isMe: true,  time: '10:23 AM' },
  { id: 5, text: 'That would be great, please send it over 👍',                                 isMe: false, time: '10:24 AM' },
];

/* ── Wallpaper SVG (WhatsApp) ───────────────────────────────── */
const WA_BG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4bdb3' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ── SVG Icons ──────────────────────────────────────────────── */
const Icon = {
  Send:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Emoji:    () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>,
  Attach:   () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>,
  Like:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="#0084ff"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>,
  Phone:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
  Video:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,
  Info:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
  Back:     () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  DoubleTick: () => <svg width="18" height="12" viewBox="0 0 28 14" fill="none"><path d="M1 7l5 5L18 1M9 7l5 5L26 1" stroke="#53bdeb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bold:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>,
  Format:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>,
  Signature:() => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
};

/* ── Empty / No-selection screen ───────────────────────────── */
function EmptyState() {
  return (
    <div className="cw-empty">
      <div className="cw-empty-icon">💬</div>
      <h3 className="cw-empty-title">Your Messages</h3>
      <p className="cw-empty-sub">Select a conversation to start messaging</p>
    </div>
  );
}

/* ── Single Bubble ──────────────────────────────────────────── */
function Bubble({ msg, t, platform }) {
  if (t.isEmail) {
    return (
      <div className={`cw-email-row ${msg.isMe ? 'cw-email-me' : 'cw-email-them'}`}>
        {!msg.isMe && (
          <div className="cw-email-avatar" style={{ background: t.avatarGradient }}>R</div>
        )}
        <div className="cw-email-wrap">
          {!msg.isMe && <span className="cw-email-sender">Rahim Ahmed</span>}
          <div className="cw-email-bubble"
            style={{ background: msg.isMe ? t.myBubbleBg : t.theirBubbleBg, color: msg.isMe ? t.myBubbleText : t.theirBubbleText }}>
            {msg.text}
          </div>
          <span className="cw-bubble-time">{msg.time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`cw-bubble-row ${msg.isMe ? 'cw-me' : 'cw-them'}`}>
      {!msg.isMe && (
        <div className="cw-b-avatar" style={{ background: t.avatarGradient }}>R</div>
      )}
      <div className="cw-bwrap">
        <div className="cw-bubble"
          style={{
            background: msg.isMe ? t.myBubbleBg : t.theirBubbleBg,
            color: msg.isMe ? t.myBubbleText : t.theirBubbleText,
            borderRadius: msg.isMe
              ? `${t.bubbleRadius} ${t.bubbleRadius} ${t.isEmail ? '0' : '4px'} ${t.bubbleRadius}`
              : `${t.bubbleRadius} ${t.bubbleRadius} ${t.bubbleRadius} ${t.isEmail ? '0' : '4px'}`,
          }}>
          {msg.text}
        </div>
        <div className={`cw-bmeta ${msg.isMe ? 'cw-meta-r' : 'cw-meta-l'}`}>
          <span className="cw-bubble-time">{msg.time}</span>
          {msg.isMe && t.showTicks && <Icon.DoubleTick />}
        </div>
      </div>
    </div>
  );
}

/* ── Outlook Compose Bar ────────────────────────────────────── */
function OutlookCompose({ t, val, setVal, onSend }) {
  return (
    <div className="cw-outlook-compose">
      <div className="cw-outlook-toolbar">
        {[{ icon: <Icon.Attach />, label: 'Attach' }, { icon: <Icon.Format />, label: 'Format' }, { icon: <Icon.Bold />, label: 'Bold' }, { icon: <Icon.Signature />, label: 'Signature' }].map(({ icon, label }) => (
          <button key={label} className="cw-outlook-tool" title={label}>
            {icon}<span>{label}</span>
          </button>
        ))}
      </div>
      <textarea
        className="cw-outlook-ta"
        placeholder="Reply..."
        rows={4}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) onSend(); }}
      />
      <div className="cw-outlook-send-row">
        <button className="cw-outlook-send-btn" style={{ background: t.sendBtnBg }} onClick={onSend}>
          Send <Icon.Send />
        </button>
        <span className="cw-outlook-hint">Ctrl+Enter to send</span>
        <button className="cw-outlook-discard">Discard</button>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function ChatWindow({ user, onBack }) {
  const [inputVal, setInputVal]   = useState('');
  const [messages, setMessages]   = useState(SEED_MESSAGES);
  const bottomRef                 = useRef(null);
  const t                         = THEMES[user?.platform] || THEMES.Facebook;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, user]);

  const sendMsg = () => {
    if (!inputVal.trim()) return;
    setMessages((prev) => [...prev, {
      id:   Date.now(),
      text: inputVal.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInputVal('');
  };

  if (!user) return <EmptyState />;

  return (
    <div className="cw-root" style={{ fontFamily: t.isEmail ? "'Calibri','Segoe UI',sans-serif" : "'Segoe UI',system-ui,sans-serif" }}>

      {/* ── Header ──────────────────────────────────── */}
      <div className="cw-header" style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}` }}>
        <button className="cw-back" style={{ color: t.headerText }} onClick={onBack}><Icon.Back /></button>

        <div className="cw-h-avatar" style={{ background: t.avatarGradient }}>
          {user.name.charAt(0)}
          <span className="cw-h-dot" style={{ background: t.accentColor }} />
        </div>

        <div className="cw-h-info">
          <span className="cw-h-name" style={{ color: t.headerText }}>{t.isEmail ? `RE: Message from ${user.name}` : user.name}</span>
          {t.statusLabel && <span className="cw-h-status" style={{ color: t.subText }}>{t.statusLabel}</span>}
        </div>

        <div className="cw-h-actions">
          {/* {t.showCalls && (
            <>
              <button className="cw-h-btn" style={{ color: t.headerText }} title="Voice call"><Icon.Phone /></button>
              <button className="cw-h-btn" style={{ color: t.headerText }} title="Video call"><Icon.Video /></button>
            </>
          )}
          <button className="cw-h-btn" style={{ color: t.headerText }} title="Info"><Icon.Info /></button> */}
          <button className="cw-convert-btn"
            style={{ background: t.isEmail ? '#fff' : t.accentColor, color: t.isEmail ? t.accentColor : '#fff', border: t.isEmail ? `1px solid #fff` : 'none' }}>
            + Convert
          </button>
        </div>
      </div>

      {/* Outlook: subject bar */}
      {t.isEmail && (
        <div className="cw-outlook-subject">
          <span className="cw-subject-label">Subject:</span>
          <span className="cw-subject-text">RE: {user.lastMsg}</span>
          <span className="cw-outlook-badge">Outlook</span>
        </div>
      )}

      {/* ── Messages ────────────────────────────────── */}
      <div className="cw-messages"
        style={{ background: t.chatBg, backgroundImage: t.wallpaper ? WA_BG : 'none' }}>

        {!t.isEmail && (
          <div className="cw-date-chip" style={{ color: t.wallpaper ? '#667781' : '#65676b', background: t.wallpaper ? 'rgba(255,255,255,0.85)' : 'transparent' }}>
            Today
          </div>
        )}

        {messages.map((msg) => (
          <Bubble key={msg.id} msg={msg} t={t} platform={user.platform} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ───────────────────────────────────── */}
      {t.isEmail ? (
        <OutlookCompose t={t} val={inputVal} setVal={setInputVal} onSend={sendMsg} />
      ) : (
        <div className="cw-input-bar" style={{ background: t.inputAreaBg, borderTop: `1px solid ${t.headerBorder}` }}>
          {t.showEmoji && (
            <button className="cw-inp-btn" style={{ color: t.accentColor }}><Icon.Emoji /></button>
          )}
          {t.showAttach && (
            <button className="cw-inp-btn" style={{ color: t.wallpaper ? '#54656f' : t.accentColor }}><Icon.Attach /></button>
          )}
          <input
            className="cw-input"
            placeholder={t.inputPlaceholder}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}` }}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMsg(); }}
          />
          {t.showLike && !inputVal ? (
            <button className="cw-inp-btn"><Icon.Like /></button>
          ) : (
            <button className="cw-send-btn" style={{ background: t.sendBtnBg }} onClick={sendMsg}><Icon.Send /></button>
          )}
        </div>
      )}
    </div>
  );
}