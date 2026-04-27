import React from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import SocialConnectionSection from './SocialConnectionSection';
import { FACEBOOK_FIELDS } from '../../constants/socialSettings';

export default function FacebookSettingsSection(props) {
  return (
    <SocialConnectionSection
      {...props}
      title="Facebook Messenger"
      subtitle="Configure Facebook Messenger connections with Meta Graph API."
      icon={<FacebookIcon sx={{ fontSize: 22 }} />}
      accent={{ color: '#1877f2', bg: '#eff6ff', border: '#bfdbfe' }}
      channelKey="facebook"
      fields={FACEBOOK_FIELDS}
      primaryField="pageName"
      identifierFields={['pageId', 'graphApiVersion']}
      // docs={[
      //   { label: 'Messenger Platform', href: 'https://developers.facebook.com/docs/messenger-platform/' },
      //   { label: 'Page Webhooks', href: 'https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-pages/' },
      // ]}
    />
  );
}
