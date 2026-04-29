import { useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ClientForm from '../../client/components/ClientForm';

export default function SocialClientModal({
  open,
  businessEntityId = '',
  onClose,
  onSaved,
}) {
  const initialClient = useMemo(() => (
    businessEntityId
      ? { business_entity_id: Number(businessEntityId) }
      : null
  ), [businessEntityId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2.25, borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 20, color: '#2563eb' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Create New Client
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
              Add the client, then we&apos;ll reopen the lead form automatically.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <ClientForm
          initialClient={initialClient}
          mode="create"
          onCancel={onClose}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}
