import { useState } from 'react';
import Button from '@mui/material/Button';
import SocialLeadDrawer from './SocialLeadDrawer';
import SocialTaskDrawer from './SocialTaskDrawer';
import SocialTicketDrawer from './SocialTicketDrawer';
import SocialClientModal from './SocialClientModal';

export default function SocialConversationActions({
  primaryButtonSx,
  secondaryButtonSx,
  tertiaryButtonSx,
}) {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [taskDrawerVersion, setTaskDrawerVersion] = useState(0);
  const [ticketDrawerVersion, setTicketDrawerVersion] = useState(0);
  const [leadDraft, setLeadDraft] = useState(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  const handleLeadAddClientRequested = (values) => {
    setLeadDraft(values);
    setActiveDrawer(null);
    setClientModalOpen(true);
  };

  const handleClientModalClose = () => {
    setClientModalOpen(false);
    setActiveDrawer('lead');
  };

  const handleClientSaved = (client) => {
    setLeadDraft((prev) => ({
      ...(prev || {}),
      client_id: client?.id ? String(client.id) : '',
    }));
    setClientModalOpen(false);
    setActiveDrawer('lead');
  };

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={() => {
          setActiveDrawer('lead');
        }}
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
        draftInitialValues={leadDraft}
        onAddClientRequested={handleLeadAddClientRequested}
        onLeadSubmitted={() => setLeadDraft(null)}
      />
      <SocialTaskDrawer
        key={`social-task-${taskDrawerVersion}`}
        open={activeDrawer === 'task'}
        onClose={() => setActiveDrawer(null)}
        onSubmitted={() => setTaskDrawerVersion((value) => value + 1)}
      />
      <SocialTicketDrawer
        key={`social-ticket-${ticketDrawerVersion}`}
        open={activeDrawer === 'ticket'}
        onClose={() => setActiveDrawer(null)}
        onSubmitted={() => setTicketDrawerVersion((value) => value + 1)}
      />
      <SocialClientModal
        open={clientModalOpen}
        businessEntityId={leadDraft?.business_entity_id || ''}
        onClose={handleClientModalClose}
        onSaved={handleClientSaved}
      />
    </>
  );
}
