import React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import SocialConnectionSection from './SocialConnectionSection';
import { FACEBOOK_FIELDS } from '../../constants/socialSettings';

export default function FacebookSettingsSection() {
  return (
    <SocialConnectionSection
      title="Facebook Messenger"
      subtitle="Configure one or more Facebook Page connections per business entity and keep only one active at a time."
      icon={<FacebookIcon sx={{ fontSize: 22 }} />}
      accent={{ color: '#1877f2', bg: '#eff6ff', border: '#bfdbfe' }}
      channelKey="facebook"
      fields={FACEBOOK_FIELDS}
      primaryField="pageName"
      identifierFields={['pageId', 'graphApiVersion']}
      docs={[
        { label: 'Messenger Platform', href: 'https://developers.facebook.com/docs/messenger-platform/' },
        { label: 'Page Webhooks', href: 'https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-pages/' },
      ]}
      backendNotes={[
        'Backend should validate the token against Meta Graph before saving and keep credentials in the database, not in frontend code.',
        'For webhook delivery, backend should complete verification and subscribe the page with POST /{page-id}/subscribed_apps.',
        'Sending replies should use the active page access token for the selected business entity and page.',
      ]}
    />
  );
}
