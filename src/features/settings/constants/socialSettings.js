import { entities as socialEntities } from '../../social/data/mockData';

export const SOCIAL_BUSINESS_ENTITIES = socialEntities.map((entity) => ({
  id: entity,
  label: entity,
}));

export const FACEBOOK_FIELDS = [
  { name: 'appId', label: 'Meta App ID *', required: true },
  { name: 'appSecret', label: 'Meta App Secret *', required: true, type: 'password' },
  { name: 'graphApiVersion', label: 'Graph API Version *', required: true, placeholder: 'vXX.X' },
  { name: 'pageId', label: 'Facebook Page ID *', required: true },
  { name: 'pageName', label: 'Facebook Page Name *', required: true },
  { name: 'webhookVerifyToken', label: 'Webhook Verify Token *', required: true, type: 'password' },
  { name: 'pageAccessToken', label: 'Page Access Token *', required: true, type: 'password', multiline: true, rows: 3 },
];

export const WHATSAPP_FIELDS = [
  { name: 'appId', label: 'Meta App ID *', required: true },
  { name: 'appSecret', label: 'Meta App Secret *', required: true, type: 'password' },
  { name: 'graphApiVersion', label: 'Graph API Version *', required: true, placeholder: 'vXX.X' },
  { name: 'businessAccountId', label: 'WhatsApp Business Account ID *', required: true },
  { name: 'phoneNumberId', label: 'Phone Number ID *', required: true },
  { name: 'displayPhoneNumber', label: 'Display Phone Number *', required: true, placeholder: '+8801XXXXXXXXX' },
  { name: 'accessToken', label: 'Access Token *', required: true, type: 'password', multiline: true, rows: 3 },
  { name: 'webhookVerifyToken', label: 'Webhook Verify Token *', required: true, type: 'password' },
];

export const EMAIL_FIELDS = [
  { name: 'providerLabel', label: 'Provider Label *', required: true, placeholder: 'Google Workspace / Outlook / Custom IMAP' },
  { name: 'emailAddress', label: 'Email Address *', required: true, type: 'email' },
  { name: 'imapHost', label: 'IMAP Host *', required: true, placeholder: 'imap.example.com' },
  { name: 'imapPort', label: 'IMAP Port *', required: true, type: 'number', placeholder: '993' },
  { name: 'imapUsername', label: 'IMAP Username *', required: true },
  { name: 'imapPassword', label: 'IMAP Password / App Password *', required: true, type: 'password' },
  {
    name: 'encryption',
    label: 'Encryption *',
    required: true,
    select: true,
    options: [
      { value: 'ssl_tls', label: 'SSL/TLS' },
      { value: 'starttls', label: 'STARTTLS' },
      { value: 'none', label: 'None' },
    ],
  },
  { name: 'mailbox', label: 'Mailbox / Folder *', required: true, placeholder: 'INBOX' },
  { name: 'pollingIntervalSeconds', label: 'Polling Interval (seconds) *', required: true, type: 'number', placeholder: '60' },
];
