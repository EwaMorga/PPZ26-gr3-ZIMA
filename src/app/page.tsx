'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Lock,
  MessageSquare,
  Users,
  Plus,
  LogOut,
  Search,
  Send,
  Smile,
  Check,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  Settings,
} from 'lucide-react';
import './whispers.css';

interface Contact {
  id: string;
  name: string;
  handle: string;
  initials: string;
  online: boolean;
  lastMessage: string;
  time: string;
  unread?: number;
  avatarGrad: string;
  isGroup?: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const DIRECT_CONTACTS: Contact[] = [
  { id: '1', name: 'Wiktor M.', handle: '@wiktor.mob', initials: 'WM', online: false, lastMessage: 'Hej! Czy to zadowoli wielmożne państwo?', time: '15:20', avatarGrad: 'avatar-grad-3' },
  { id: '2', name: 'Ewa M.', handle: '@ewa.po', initials: 'EM', online: true, lastMessage: 'JD.', time: '17:04', unread: 2, avatarGrad: 'avatar-grad-1' },
  { id: '3', name: 'Oliwier P.', handle: '@oliwier.be', initials: 'OP', online: true, lastMessage: 'Kanał z Oliwier P. jest zabezpieczony szyfrowaniem E2EE.', time: '16:51', avatarGrad: 'avatar-grad-2' },
  { id: '4', name: 'Samuel Z.', handle: '@samuel.sm', initials: 'SZ', online: true, lastMessage: 'Jestem rudy', time: '14:12', unread: 1, avatarGrad: 'avatar-grad-4' },
  { id: '5', name: 'Krzysztof Krawczyk', handle: '@kacper', initials: 'KK', online: true, lastMessage: 'Parostatkiem w piękny rejs', time: '13:45', avatarGrad: 'avatar-grad-5' },
  { id: '6', name: 'Adam Małysz', handle: '@maja', initials: 'AM', online: false, lastMessage: '151.5m w Willingen', time: '12:30', avatarGrad: 'avatar-grad-6' },
  { id: '7', name: 'Robert Kubica', handle: '@tomek', initials: 'RK', online: true, lastMessage: 'Niecierpię Andory', time: '11:05', avatarGrad: 'avatar-grad-2' },
  { id: '8', name: 'Mao Zedong', handle: '@zosia', initials: 'MZ', online: false, lastMessage: 'hmm', time: 'Wczoraj', avatarGrad: 'avatar-grad-3' },
  { id: '9', name: 'Norbert Gierczak', handle: '@filip', initials: 'NG', online: true, lastMessage: 'JDJDJD', time: 'Wczoraj', avatarGrad: 'avatar-grad-4' },
  { id: '10', name: 'Sebastian Rakieta', handle: '@natalia', initials: 'SR', online: true, lastMessage: 'dzien dobry.', time: 'Wczoraj', avatarGrad: 'avatar-grad-6' },
];

const GROUP_CONTACTS: Contact[] = [
  { id: 'g1', name: 'Projekt PPZ', handle: '5 członków', initials: 'PP', online: true, lastMessage: 'To dobrze, że dobrze.', time: '17:08', unread: 3, avatarGrad: 'avatar-grad-2', isGroup: true },
  ];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'other', text: 'Hej! Czy to zadowoli wielmożne państwo?', time: '16:58' },
    { id: 'm2', sender: 'me', text: 'Nic tutaj jeszcze nie działa.', time: '17:00', status: 'read' },
    { id: 'm3', sender: 'other', text: 'Za to się świeci.', time: '17:03', status: 'read' },
    { id: 'm5', sender: 'other', text: 'Więc jest jak ma być.', time: '17:04' },
  ],
  '2': [
    { id: 'm6', sender: 'other', text: 'JD.', time: '16:45' },
    { id: 'm7', sender: 'me', text: 'Przyjdź na IEMa, powiedz to samo. Tacy ludzi jak ty istnieją tylko w internecie.', time: '16:48', status: 'delivered' },
    { id: 'm8', sender: 'other', text: 'A potem przyleciał smok i...', time: '16:51' },
  ],
  'g1': [
    { id: 'm9', sender: 'other', text: 'Hej. Co tam?', time: '17:01' },
    { id: 'm10', sender: 'me', text: 'Dobrze, a u ciebie?', time: '17:05', status: 'read' },
    { id: 'm11', sender: 'other', text: 'Też dobrze.', time: '17:08' },
    { id: 'm12', sender: 'me', text: 'To dobrze, że dobrze.', time: '17:10', status: 'read' },

  ],
};

function DualKineticContacts({
  contacts,
  activeId,
  onSelect,
  searchQuery,
}: {
  contacts: Contact[];
  activeId: string;
  onSelect: (c: Contact) => void;
  searchQuery: string;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftPos = useRef(0);
  const rightPos = useRef(0);
  const initialized = useRef(false);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const leftHalf = filtered.filter((_, i) => i % 2 === 0);
  const rightHalf = filtered.filter((_, i) => i % 2 === 1);

  const isSearching = searchQuery.trim().length > 0;
  const leftRender = isSearching ? leftHalf : [...leftHalf, ...leftHalf, ...leftHalf];
  const rightRender = isSearching ? rightHalf : [...rightHalf, ...rightHalf, ...rightHalf];

  useEffect(() => {
    initialized.current = false;
  }, [contacts]);

  useEffect(() => {
    if (isSearching) return;

    let animId: number;
    const speed = 0.35;

    const step = () => {
      const leftEl = leftColRef.current;
      const rightEl = rightColRef.current;

      if (leftEl && rightEl) {
        const leftSetHeight = leftEl.scrollHeight / 3;
        const rightSetHeight = rightEl.scrollHeight / 3;

        if (!initialized.current && leftSetHeight > 0) {
          leftPos.current = leftSetHeight;
          leftEl.scrollTop = leftSetHeight;
          rightPos.current = 0;
          rightEl.scrollTop = 0;
          initialized.current = true;
        }

        if (!isPaused) {
          if (leftSetHeight > 0) {
            leftPos.current -= speed;
            if (leftPos.current <= 0) leftPos.current += leftSetHeight;
            leftEl.scrollTop = leftPos.current;
          }

          if (rightSetHeight > 0) {
            rightPos.current += speed;
            if (rightPos.current >= rightSetHeight) rightPos.current -= rightSetHeight;
            rightEl.scrollTop = rightPos.current;
          }
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isSearching, contacts]);

  const handleManualScroll = (side: 'left' | 'right') => {
    if (!isPaused) return;
    if (side === 'left' && leftColRef.current) {
      leftPos.current = leftColRef.current.scrollTop;
    }
    if (side === 'right' && rightColRef.current) {
      rightPos.current = rightColRef.current.scrollTop;
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="kinetic-empty">
        Brak wyników dla &ldquo;{searchQuery}&rdquo;
      </div>
    );
  }

  const renderCard = (contact: Contact, idx: number, prefix: string) => {
    const isActive = contact.id === activeId;
    return (
      <button
        key={`${prefix}-${contact.id}-${idx}`}
        onClick={() => onSelect(contact)}
        className={`contact-card ${isActive ? 'contact-card--active' : ''}`}
      >
        <div className="contact-card-top">
          <div className="avatar-wrap">
            <div className={`contact-avatar ${contact.avatarGrad}`}>
              {contact.initials}
            </div>
            <span
              className={`status-dot ${
                contact.online ? 'status-dot--online' : 'status-dot--offline'
              }`}
            />
          </div>

          {contact.unread ? (
            <span className="unread-badge">{contact.unread}</span>
          ) : (
            <span className="contact-time">{contact.time}</span>
          )}
        </div>

        <p className="contact-name">{contact.name}</p>
        <p className="contact-preview">{contact.lastMessage}</p>
      </button>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="kinetic-grid"
    >
      <div className="kinetic-fade-top" />
      <div className="kinetic-fade-bottom" />

      <div
        ref={leftColRef}
        onScroll={() => handleManualScroll('left')}
        className="kinetic-col"
      >
        {leftRender.map((c, idx) => renderCard(c, idx, 'L'))}
      </div>

      <div
        ref={rightColRef}
        onScroll={() => handleManualScroll('right')}
        className="kinetic-col"
      >
        {rightRender.map((c, idx) => renderCard(c, idx, 'R'))}
      </div>

      <AnimatePresence>
        {isPaused && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="kinetic-pause-badge"
          >
            Zatrzymano · scrolluj swobodnie
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WhispersApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    username: 'Mikołaj',
    email: 'mikolaj@whispers.app',
    password: '••••••••',
    confirmPassword: '',
  });
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Mikołaj', handle: '@mikolaj' });

  const [navTab, setNavTab] = useState<'direct' | 'groups'>('direct');
  const [activeContact, setActiveContact] = useState<Contact>(DIRECT_CONTACTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentContacts = navTab === 'direct' ? DIRECT_CONTACTS : GROUP_CONTACTS;
  const currentMessages = messagesByChat[activeContact.id] || [
    {
      id: 'init-e2ee',
      sender: 'other',
      text: `Kanał z ${activeContact.name} jest zabezpieczony szyfrowaniem E2EE.`,
      time: 'Teraz',
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeContact.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthError('Wypełnij wszystkie pola.');
      return;
    }
    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthError('Hasła nie są identyczne.');
      return;
    }
    setAuthError('');
    const displayName =
      authMode === 'register' && authForm.username.trim()
        ? authForm.username.trim()
        : authForm.email.split('@')[0] || 'Mikołaj';

    setCurrentUser({
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      handle: `@${displayName.toLowerCase().replace(/\s+/g, '')}`,
    });
    setIsLoggedIn(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: draft.trim(),
      time: timeStr,
      status: 'delivered',
    };

    const chatId = activeContact.id;
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || currentMessages), newMsg],
    }));
    setDraft('');
  };

  return (
    <div className="whispers-root">
      <div className="bg-flame-layer">
        <motion.div
          animate={{ x: ['-5%', '8%', '-3%'], y: ['4%', '-8%', '6%'], scale: [1, 1.18, 0.96, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="flame-blob flame-blob-1"
        />
        <motion.div
          animate={{ x: ['6%', '-10%', '4%'], y: ['-6%', '10%', '-4%'], scale: [1.1, 0.92, 1.15, 1.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="flame-blob flame-blob-2"
        />
        <motion.div
          animate={{ x: ['0%', '12%', '-8%', '0%'], y: ['8%', '-12%', '4%', '8%'], opacity: [0.22, 0.38, 0.2, 0.22] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="flame-blob flame-blob-3"
        />
        <div className="bg-vignette" />
      </div>

      <motion.div
        animate={{
          filter: isLoggedIn ? 'blur(0px) brightness(1)' : 'blur(16px) brightness(0.45)',
          scale: isLoggedIn ? 1 : 0.98,
        }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={`app-layout ${!isLoggedIn ? 'app-layout--locked' : ''}`}
      >
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="left-sector"
        >
          <div className="glass-panel profile-card">
            <div className="profile-info">
              <div className="avatar-wrap">
                <div className="profile-avatar">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="status-dot status-dot--lg status-dot--online" />
              </div>
              <div className="profile-meta">
                <div className="profile-name-row">
                  <span className="profile-name">{currentUser.name}</span>
                  <span className="online-badge">Online</span>
                </div>
                <p className="profile-handle">{currentUser.handle} · Whispers</p>
              </div>
            </div>

            <div className="profile-actions">
              <button
                onClick={() => showToast('Ustawienia profilu pojawią się w kolejnych sprintach')}
                title="Ustawienia"
                className="icon-btn"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={() => setIsLoggedIn(false)}
                title="Wyloguj (pokaż modal)"
                className="icon-btn icon-btn--logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          <div className="left-lower">
            <div className="glass-panel nav-rail">
              <div className="nav-rail-top">
                <div className="brand-mark">
                  <Flame size={20} />
                </div>

                <div className="rail-divider" />

                <button
                  onClick={() => {
                    setNavTab('direct');
                    setActiveContact(DIRECT_CONTACTS[0]);
                  }}
                  title="Wiadomości 1-na-1"
                  className="rail-btn"
                >
                  {navTab === 'direct' && (
                    <motion.div
                      layoutId="navPill"
                      className="rail-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <MessageSquare
                    size={20}
                    className={`rail-icon ${navTab === 'direct' ? 'rail-icon--active' : ''}`}
                  />
                </button>

                <button
                  onClick={() => {
                    setNavTab('groups');
                    setActiveContact(GROUP_CONTACTS[0]);
                  }}
                  title="Czaty grupowe (Sprint 3)"
                  className="rail-btn"
                >
                  {navTab === 'groups' && (
                    <motion.div
                      layoutId="navPill"
                      className="rail-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Users
                    size={20}
                    className={`rail-icon ${navTab === 'groups' ? 'rail-icon--active' : ''}`}
                  />
                </button>

                <button
                  onClick={() => showToast('Tworzenie pokoi grupowych wjeżdża w Sprincie 3')}
                  title="Nowy pokój grupowy"
                  className="rail-add-btn"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div title="Szyfrowanie End-to-End aktywne" className="e2ee-shield-badge">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="glass-panel contacts-panel">
              <div className="contacts-header">
                <h2 className="contacts-title">
                  {navTab === 'direct' ? 'Znajomi' : 'Grupy'}
                </h2>
                <span className="contacts-online-count">
                  {currentContacts.filter((c) => c.online).length} online
                </span>
              </div>

              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj rozmowy..."
                  className="search-input"
                />
              </div>

              <DualKineticContacts
                contacts={currentContacts}
                activeId={activeContact.id}
                onSelect={setActiveContact}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </motion.div>

        <motion.main
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="glass-panel chat-panel"
        >
          <header className="chat-header">
            <div className="chat-header-left">
              <div className="avatar-wrap">
                <div className={`chat-avatar ${activeContact.avatarGrad}`}>
                  {activeContact.initials}
                </div>
                <span
                  className={`status-dot ${
                    activeContact.online ? 'status-dot--online' : 'status-dot--offline'
                  }`}
                />
              </div>
              <div>
                <h1 className="chat-title">{activeContact.name}</h1>
                <p className="chat-subtitle">
                  {activeContact.isGroup
                    ? activeContact.handle
                    : activeContact.online
                    ? 'Aktywny teraz'
                    : 'Offline'}
                </p>
              </div>
            </div>

            <div className="e2ee-pill">
              <Lock size={14} />
              <span>Szyfrowane E2EE</span>
            </div>
          </header>

          <div className="messages-area">
            <div className="e2ee-banner-wrap">
              <span className="e2ee-banner">
                <Sparkles size={12} className="e2ee-banner-icon" />
                Wiadomości w tym pokoju są szyfrowane kluczami po stronie klienta
              </span>
            </div>

            <AnimatePresence initial={false}>
              {currentMessages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className={`msg-row ${isMe ? 'msg-row--me' : 'msg-row--other'}`}
                  >
                    <div className={`msg-bubble ${isMe ? 'msg-bubble--me' : 'msg-bubble--other'}`}>
                      <p className="msg-text">{msg.text}</p>
                      <div className={`msg-meta ${isMe ? 'msg-meta--me' : 'msg-meta--other'}`}>
                        <span>{msg.time}</span>
                        {isMe && msg.status === 'read' && <CheckCheck size={14} className="tick-read" />}
                        {isMe && msg.status === 'delivered' && <CheckCheck size={14} className="tick-dim" />}
                        {isMe && msg.status === 'sent' && <Check size={14} className="tick-dim" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="composer-form">
            <div className="composer-bar">
              <button
                type="button"
                onClick={() => showToast('Selektor emotek wchodzi w Sprincie 4')}
                title="Emotki (Sprint 4)"
                className="composer-emoji-btn"
              >
                <Smile size={20} />
              </button>

              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Napisz zaszyfrowaną wiadomość do ${activeContact.name}...`}
                className="composer-input"
              />

              <motion.button whileTap={{ scale: 0.92 }} type="submit" className="composer-send-btn">
                <span>Wyślij</span>
                <Send size={14} />
              </motion.button>
            </div>
          </form>
        </motion.main>
      </motion.div>

      <AnimatePresence>
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="modal-backdrop"
          >
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-panel modal-card"
            >
              <div className="modal-glow" />

              <div className="modal-brand">
                <div className="modal-logo">
                  <Flame size={28} />
                </div>
                <h1 className="modal-title">Whispers</h1>
                <p className="modal-subtitle">
                  <Lock size={12} className="modal-subtitle-icon" />
                  Szyfrowany komunikator czasu rzeczywistego
                </p>
              </div>

              <div className="auth-tabs">
                {(['login', 'register'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setAuthMode(mode);
                      setAuthError('');
                    }}
                    className="auth-tab-btn"
                  >
                    {authMode === mode && (
                      <motion.div
                        layoutId="authTabPill"
                        className="auth-tab-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className={`auth-tab-label ${authMode === mode ? 'auth-tab-label--active' : ''}`}>
                      {mode === 'login' ? 'Logowanie' : 'Rejestracja'}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuthSubmit} className="auth-form">
                <AnimatePresence mode="popLayout">
                  {authMode === 'register' && (
                    <motion.div
                      key="username-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="form-group-anim"
                    >
                      <label className="form-label">Nazwa użytkownika</label>
                      <input
                        type="text"
                        value={authForm.username}
                        onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                        placeholder="np. Mikołaj"
                        className="form-input"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    placeholder="twoj@email.pl"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Hasło</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>

                <AnimatePresence mode="popLayout">
                  {authMode === 'register' && (
                    <motion.div
                      key="confirm-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="form-group-anim"
                    >
                      <label className="form-label">Powtórz hasło</label>
                      <input
                        type="password"
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {authError && <p className="form-error">{authError}</p>}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="auth-submit-btn"
                >
                  {authMode === 'login' ? 'Wejdź do Whispers' : 'Utwórz szyfrowane konto'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="toast-box"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}