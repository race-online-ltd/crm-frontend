import { SocialProvider } from '../context/SocialContext';
import EntityTabs from '../components/EntityTabs';
import MediumTabs from '../components/MediumTabs';
import SocialInbox from '../components/SocialInbox';
import '../styles/social.css';

const SocialPage = () => {
  return (
    <SocialProvider>
      <div className="social-page">
        <div className="social-tabs-wrapper">
          <EntityTabs />
          <MediumTabs />
        </div>
        <div className="social-inbox-container">
          <SocialInbox />
        </div>
      </div>
    </SocialProvider>
  );
};

export default SocialPage;