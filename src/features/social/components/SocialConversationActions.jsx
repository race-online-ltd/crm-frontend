import { useState } from 'react';
import Button from '@mui/material/Button';
import SocialLeadDrawer from './SocialLeadDrawer';
import SocialTaskDrawer from './SocialTaskDrawer';
import SocialTicketDrawer from './SocialTicketDrawer';

export default function SocialConversationActions({
  primaryButtonSx,
  secondaryButtonSx,
  tertiaryButtonSx,
}) {
  const [activeDrawer, setActiveDrawer] = useState(null);

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={() => setActiveDrawer('lead')}
        sx={primaryButtonSx}
      >
        Convert to lead
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => setActiveDrawer('task')}
        sx={secondaryButtonSx}
      >
        Convert to task
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => setActiveDrawer('ticket')}
        sx={tertiaryButtonSx}
      >
        Convert to ticket
      </Button>

      <SocialLeadDrawer
        open={activeDrawer === 'lead'}
        onClose={() => setActiveDrawer(null)}
      />
      <SocialTaskDrawer
        open={activeDrawer === 'task'}
        onClose={() => setActiveDrawer(null)}
      />
      <SocialTicketDrawer
        open={activeDrawer === 'ticket'}
        onClose={() => setActiveDrawer(null)}
      />
    </>
  );
}
