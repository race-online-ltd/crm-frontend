import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function ChatReleaseDialog({ chat, open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={700} fontSize={17}>
          Release Chat
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography fontSize={14} color="#475569">
          Do you want to release this chat from assigned mode?
        </Typography>
        {chat ? (
          <Typography fontSize={13} color="#111827" fontWeight={600} mt={1}>
            {chat.name}
          </Typography>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Release
        </Button>
      </DialogActions>
    </Dialog>
  );
}
