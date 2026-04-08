import React from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SocialConnectionSection from './SocialConnectionSection';
import { EMAIL_FIELDS } from '../../constants/socialSettings';

export default function EmailSettingsSection() {
  return (
    <SocialConnectionSection
      title="Email Receive Configuration"
      subtitle="Configure receive-only mailbox connections per business entity."
      icon={<EmailOutlinedIcon sx={{ fontSize: 22 }} />}
      accent={{ color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }}
      channelKey="email"
      fields={EMAIL_FIELDS}
      primaryField="emailAddress"
      identifierFields={['providerLabel', 'imapHost', 'mailbox']}
      // docs={[
      //   { label: 'Gmail IMAP', href: 'https://support.google.com/mail/answer/7126229' },
      //   { label: 'Outlook IMAP', href: 'https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040' },
      // ]}
    />
  );
}
