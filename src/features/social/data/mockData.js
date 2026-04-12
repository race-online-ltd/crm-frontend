const entities = [
  'Race Online Ltd.',
  'Earth Telecom',
  'Dhaka COLO',
  'Orbit Internet',
  'Creative BD',
  'Ocloud',
];

const messengerContacts = [
  {
    id: 'm1',
    name: 'Ahmed Khan',
    lastMessage: 'Sure, I will check and get back to you.',
    lastMessageTime: '2:30 PM',
    unreadCount: 3,
    online: true,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'm2',
    name: 'Fatima Begum',
    lastMessage: 'Thank you for the quick response!',
    lastMessageTime: '1:15 PM',
    unreadCount: 0,
    online: false,
    queueStatus: 'active',
    assignedAgentId: 'agent_2',
    assignedAgentName: 'Agent 2',
    simulateRaceOnPick: false,
  },
  {
    id: 'm3',
    name: 'Rahim Uddin',
    lastMessage: 'Can you send me the pricing details?',
    lastMessageTime: '12:45 PM',
    unreadCount: 1,
    online: true,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'm4',
    name: 'Nadia Islam',
    lastMessage: 'The internet connection is not working properly.',
    lastMessageTime: '11:30 AM',
    unreadCount: 2,
    online: false,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'm5',
    name: 'Kamal Hossain',
    lastMessage: 'When will the technician arrive?',
    lastMessageTime: '10:00 AM',
    unreadCount: 0,
    online: true,
    queueStatus: 'active',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Agent 1',
    simulateRaceOnPick: false,
  },
  {
    id: 'm6',
    name: 'Sadia Rahman',
    lastMessage: 'I need to upgrade my plan.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    online: false,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
];

const whatsappContacts = [
  {
    id: 'w1',
    name: 'Tariq Ahmed',
    lastMessage: 'Please check the invoice attached.',
    lastMessageTime: '3:00 PM',
    unreadCount: 1,
    online: true,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'w2',
    name: 'Mina Akter',
    lastMessage: 'Thanks, issue resolved 👍',
    lastMessageTime: '2:00 PM',
    unreadCount: 0,
    online: true,
    queueStatus: 'active',
    assignedAgentId: 'agent_3',
    assignedAgentName: 'Agent 3',
    simulateRaceOnPick: false,
  },
  {
    id: 'w3',
    name: 'Jamal Haque',
    lastMessage: 'Need urgent support for server down',
    lastMessageTime: '1:30 PM',
    unreadCount: 5,
    online: false,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'w4',
    name: 'Rupa Das',
    lastMessage: 'Can I get a demo of your services?',
    lastMessageTime: '12:00 PM',
    unreadCount: 0,
    online: false,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'w5',
    name: 'Shakil Mia',
    lastMessage: 'Payment confirmation received',
    lastMessageTime: '11:00 AM',
    unreadCount: 0,
    online: true,
    queueStatus: 'active',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Agent 1',
    simulateRaceOnPick: false,
  },
];

const emailContacts = [
  {
    id: 'e1',
    name: 'Imran Chowdhury',
    lastMessage: 'Re: Service Agreement Renewal',
    lastMessageTime: '3:45 PM',
    unreadCount: 1,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'e2',
    name: 'Nasreen Sultana',
    lastMessage: 'Invoice #4521 - Payment Due',
    lastMessageTime: '2:30 PM',
    unreadCount: 0,
    queueStatus: 'active',
    assignedAgentId: 'agent_2',
    assignedAgentName: 'Agent 2',
    simulateRaceOnPick: false,
  },
  {
    id: 'e3',
    name: 'Farhan Ali',
    lastMessage: 'Meeting Schedule for Next Week',
    lastMessageTime: '1:00 PM',
    unreadCount: 2,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'e4',
    name: 'Taslima Khatun',
    lastMessage: 'Re: Technical Support Request',
    lastMessageTime: '11:45 AM',
    unreadCount: 0,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
  {
    id: 'e5',
    name: 'Arif Hasan',
    lastMessage: 'Quotation for Dedicated Server',
    lastMessageTime: '10:30 AM',
    unreadCount: 1,
    queueStatus: 'active',
    assignedAgentId: 'agent_1',
    assignedAgentName: 'Agent 1',
    simulateRaceOnPick: false,
  },
  {
    id: 'e6',
    name: 'Sumaiya Begum',
    lastMessage: 'Feedback on Cloud Migration',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    queueStatus: 'unread',
    assignedAgentId: null,
    assignedAgentName: null,
    simulateRaceOnPick: false,
  },
];

export const CONTACT_TEMPLATES_BY_MEDIUM = {
  messenger: messengerContacts,
  whatsapp: whatsappContacts,
  email: emailContacts,
};

const messengerMessages = [
  { id: '1', senderId: 'm1', senderName: 'Ahmed Khan', content: 'Hi, I have a question about my internet plan.', timestamp: '2:25 PM', isOwn: false },
  { id: '2', senderId: 'self', senderName: 'You', content: 'Hello Ahmed! Sure, how can I help you?', timestamp: '2:26 PM', isOwn: true, status: 'read' },
  { id: '3', senderId: 'm1', senderName: 'Ahmed Khan', content: 'I want to know if I can upgrade to the 100 Mbps plan.', timestamp: '2:27 PM', isOwn: false },
  { id: '4', senderId: 'self', senderName: 'You', content: 'Absolutely! The 100 Mbps plan is available in your area. Would you like me to process the upgrade?', timestamp: '2:28 PM', isOwn: true, status: 'read' },
  { id: '5', senderId: 'm1', senderName: 'Ahmed Khan', content: 'Yes please! What will be the new monthly charge?', timestamp: '2:29 PM', isOwn: false },
  { id: '6', senderId: 'self', senderName: 'You', content: 'The 100 Mbps plan costs ৳1,500/month. I will initiate the upgrade request now.', timestamp: '2:29 PM', isOwn: true, status: 'delivered' },
  { id: '7', senderId: 'm1', senderName: 'Ahmed Khan', content: 'Sure, I will check and get back to you.', timestamp: '2:30 PM', isOwn: false },
];

const whatsappMessages = [
  { id: '1', senderId: 'w1', senderName: 'Tariq Ahmed', content: 'Assalamu Alaikum, I need to discuss the billing issue.', timestamp: '2:50 PM', isOwn: false },
  { id: '2', senderId: 'self', senderName: 'You', content: 'Wa Alaikum Assalam! Please share your account number.', timestamp: '2:51 PM', isOwn: true, status: 'read' },
  { id: '3', senderId: 'w1', senderName: 'Tariq Ahmed', content: 'My account number is ET-2024-5678', timestamp: '2:52 PM', isOwn: false },
  { id: '4', senderId: 'self', senderName: 'You', content: 'Let me check... I can see there was a duplicate charge last month. I will process the refund.', timestamp: '2:55 PM', isOwn: true, status: 'read' },
  { id: '5', senderId: 'w1', senderName: 'Tariq Ahmed', content: 'Please check the invoice attached.', timestamp: '3:00 PM', isOwn: false },
];

const emailMessages = [
  { id: '1', senderId: 'e1', senderName: 'Imran Chowdhury', content: 'Dear Team,\n\nI would like to discuss the renewal terms for our service agreement. The current contract expires on March 31st and we would like to negotiate better rates for the next term.\n\nPlease let me know your availability for a meeting.\n\nBest regards,\nImran Chowdhury', timestamp: '3:30 PM', isOwn: false, subject: 'Service Agreement Renewal', isStarred: true, isRead: true },
  { id: '2', senderId: 'self', senderName: 'You', content: 'Dear Imran,\n\nThank you for reaching out regarding the renewal. We value your continued partnership.\n\nI am available for a meeting this Thursday at 3 PM. Would that work for you?\n\nBest regards,\nSupport Team', timestamp: '3:40 PM', isOwn: true, subject: 'Re: Service Agreement Renewal', status: 'delivered' },
  { id: '3', senderId: 'e1', senderName: 'Imran Chowdhury', content: 'Dear Team,\n\nThursday at 3 PM works perfectly. Please send me the meeting link.\n\nLooking forward to it.\n\nBest regards,\nImran Chowdhury', timestamp: '3:45 PM', isOwn: false, subject: 'Re: Service Agreement Renewal', isRead: false },
];

export const MESSAGE_TEMPLATES_BY_MEDIUM = {
  messenger: messengerMessages,
  whatsapp: whatsappMessages,
  email: emailMessages,
};

export const getContacts = (_entity, medium) => {
  return CONTACT_TEMPLATES_BY_MEDIUM[medium] || [];
};

export const getMessages = (_contactId, medium) => {
  return MESSAGE_TEMPLATES_BY_MEDIUM[medium] || [];
};

export { entities };
